import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials are missing. Ticket search features will return fallback messages.');
}

if (!geminiApiKey) {
  console.warn('Gemini API key missing. Agent responses will fall back to static instructions.');
}

// 1. Initialize Supabase
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// 2. Initialize Gemini
const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const hasGenAI = Boolean(genAI);

// --- TOOLS DEFINITION ---

// Tool 1: Search Events (Expanded to include Ticket Types)
const searchEventsDeclaration: FunctionDeclaration = {
  name: 'searchEvents',
  description: 'List active events with their ticket types and prices.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search keyword (optional).'
      }
    }
  }
};

// Tool 2: Generate Payment Link (New - Handles Step 4: Secure Payment)
const generatePaymentLinkDeclaration: FunctionDeclaration = {
  name: 'generatePaymentLink',
  description: 'Generates a secure PayFast checkout link.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      eventName: { type: Type.STRING, description: 'Name of the event.' },
      ticketType: { type: Type.STRING, description: 'Type of ticket (e.g., VIP, General).' },
      quantity: { type: Type.NUMBER, description: 'Number of tickets.' }
    },
    required: ['eventName', 'ticketType', 'quantity']
  }
};

// Tool 3: Check Ticket Status (Existing)
const checkTicketDeclaration: FunctionDeclaration = {
  name: 'checkTicketStatus',
  description: 'Validate ticket ID/QR.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      ticketId: { type: Type.STRING, description: 'Ticket ID or QR string.' }
    },
    required: ['ticketId']
  }
};

const tools: Tool[] = [{
  functionDeclarations: [searchEventsDeclaration, generatePaymentLinkDeclaration, checkTicketDeclaration]
}];

// --- EXECUTION FUNCTIONS ---

type TicketTypeRow = { name: string; price: number };

async function searchEvents(query?: string) {
  if (!supabase) return 'Events unavailable. Configure Supabase.';

  // Fetch events AND their ticket types so the user can see prices
  const baseSelect = `
    title,
    date,
    venue,
    status,
    ticket_types (name, price)
  `;

  let dbQuery = supabase
    .from('events')
    .select(baseSelect)
    .eq('status', 'PUBLISHED')
    .limit(5);

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  let { data, error } = await dbQuery;

  // If no published events match, fall back to any recent events so the simulator still shows data.
  if ((!data || data.length === 0) && !error) {
    const fallback = await supabase
      .from('events')
      .select(baseSelect)
      .order('date', { ascending: true })
      .limit(5);
    data = fallback.data || data;
    error = fallback.error || error;
  }

  if (error || !data || data.length === 0) return 'No events found.';
  
  // Format the output clearly for the LLM
  return data.map((event: any, index: number) => {
    const types = event?.ticket_types as TicketTypeRow[] | null;
    const statusLabel = event?.status && event.status !== 'PUBLISHED' ? ` [${event.status}]` : '';
    const typeLines = Array.isArray(types) && types.length > 0
      ? types.map((t) => `   - ${t.name}: R${t.price}`).join('\n')
      : '   - Standard: R100';
    return `${index + 1}. ${event.title} (${event.date})${statusLabel}\n${typeLines}`;
  }).join('\n\n');
}

async function generatePaymentLink(eventName: string, ticketType: string, quantity: number) {
  // In a real app, this would call PayFast API to create a session.
  // We simulate a secure link here for the demo.
  const total = 100 * quantity; // Mock total calculation
  return `Checkout Ready\nEvent: ${eventName}\nTickets: ${quantity}x ${ticketType}\n\nSecure Link: https://sayhi.africa/pay/${Date.now()}?amt=${total}`;
}

async function checkTicketStatus(ticketId: string) {
  if (!supabase) return 'Ticket validation unavailable. Configure Supabase.';

  const { data, error } = await supabase
    .from('tickets')
    .select('status, holder_name')
    .or(`id.eq.${ticketId},qr_code.eq.${ticketId}`)
    .single();

  if (error) return 'Invalid Ticket.';
  return `Status: ${data.status} | Holder: ${data.holder_name}`;
}

// --- MAIN AGENT FUNCTION ---

const extractResponseText = (payload: any): string => {
  if (!payload) return '';
  if (typeof payload.text === 'function') return payload.text() || '';
  if (typeof payload.text === 'string') return payload.text;
  
  const response = payload.response ?? payload;
  if (Array.isArray(response?.candidates)) {
    const parts = response.candidates[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((part: any) => part.text).filter(Boolean).join('\n');
    }
  }
  return '';
};

const extractFunctionCalls = (payload: any) => {
  const response = payload?.response ?? payload;
  return response?.functionCalls || payload?.functionCalls || [];
};

const buildFallbackResponse = async (userMessage: string): Promise<string> => {
  const lower = userMessage.toLowerCase();

  const ticketMatch = userMessage.match(/(?:ticket|qr|id)[^a-zA-Z0-9]?[:#]?\s*([A-Za-z0-9-]{6,})/i);
  if (ticketMatch) {
    const status = await checkTicketStatus(ticketMatch[1]);
    return `Quick check: ${status}`;
  }

  const wantsEvents = ['event', 'ticket', 'show', 'list', 'hi', 'hello', 'hey'].some(keyword =>
    lower.includes(keyword)
  );

  if (wantsEvents) {
    const list = await searchEvents();
    return `Here are events you can book:\n${list}\nReply with the option number, ticket type, and quantity for a payment link.`;
  }

  return "I can show you events and generate a PayFast link. Say 'show events' to browse or share a ticket ID to validate.";
};

export const processUserMessage = async (userMessage: string, userPhone: string): Promise<string> => {
  if (!hasGenAI) {
    return buildFallbackResponse(userMessage);
  }

  try {
    const model = 'gemini-2.0-flash'; 
    
    // SYSTEM INSTRUCTION: Strictly enforces the 5-step sales flow
    const systemInstruction = `
      Role: Say HI Africa Ticketing Agent.
      Tone: Energetic, helpful, efficient.
      
      Your Goal is to sell tickets. Follow this exact flow:
      1. Browse: If user says "Hi" or asks for events, call 'searchEvents'. Display the list with prices.
      2. Select: If user selects an event (e.g. "I want option 1"), ask for "Ticket Type" (if multiple) and "Quantity".
      3. Payment: Once you have Event + Type + Quantity, call 'generatePaymentLink'.
      4. Delivery: Tell the user the QR code will be sent to this chat immediately after payment.

      Rules:
      - Always use the tools provided.
      - Do not make up links. Use 'generatePaymentLink'.
      - Keep responses short (WhatsApp style).
    `;

    // 1. First turn - Send user message to Gemini
    const result = await genAI!.models.generateContent({
      model,
      contents: userMessage,
      config: { tools, systemInstruction }
    });

    const response = result;
    const functionCalls = extractFunctionCalls(response);
    
    // 2. Handle Tool Calls
    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let functionResult = "";

        if (name === 'searchEvents') {
          functionResult = await searchEvents(args['query'] as string);
        } else if (name === 'generatePaymentLink') {
          functionResult = await generatePaymentLink(
            args['eventName'] as string, 
            args['ticketType'] as string, 
            args['quantity'] as number
          );
        } else if (name === 'checkTicketStatus') {
          functionResult = await checkTicketStatus(args['ticketId'] as string);
        }

        functionResponses.push({
          name: name,
          response: { result: functionResult },
          id: call.id 
        });
      }

      // 3. Second turn - Feed tool results back to Gemini for final response
      const secondResult = await genAI!.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: userMessage }] },
          { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
          { role: 'function', parts: functionResponses.map(fr => ({ 
              functionResponse: { name: fr.name, response: fr.response } 
            })) 
          }
        ],
        config: { tools, systemInstruction } 
      });

      return extractResponseText(secondResult) || "Error processing request.";
    }

    return extractResponseText(response) || "How can I help you today?";

  } catch (error) {
    console.error("Agent Error:", error);
    return buildFallbackResponse(userMessage);
  }
};

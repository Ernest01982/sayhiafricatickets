import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) console.warn('Supabase credentials missing.');
if (!geminiApiKey) console.warn('Gemini API key missing.');

// 1. Initialize Supabase
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// 2. Initialize Gemini
const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// --- TOOLS DEFINITION ---

const searchEventsDeclaration: FunctionDeclaration = {
  name: 'searchEvents',
  description: 'List active events with their ticket types and prices.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Search keyword (optional).' }
    }
  }
};

const generatePaymentLinkDeclaration: FunctionDeclaration = {
  name: 'generatePaymentLink',
  description: 'Generates a secure PayFast checkout link.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      eventName: { type: Type.STRING, description: 'Name of the event.' },
      ticketType: { type: Type.STRING, description: 'Type of ticket selected.' },
      quantity: { type: Type.NUMBER, description: 'Number of tickets.' },
      customerName: { type: Type.STRING, description: 'Customer Name and Surname.' }
    },
    required: ['eventName', 'ticketType', 'quantity', 'customerName']
  }
};

const tools: Tool[] = [{
  functionDeclarations: [searchEventsDeclaration, generatePaymentLinkDeclaration]
}];

// --- EXECUTION FUNCTIONS ---

async function searchEvents(query?: string) {
  if (!supabase) return 'Events unavailable.';

  let dbQuery = supabase
    .from('events')
    .select(`title, date, venue, ticket_types (name, price)`)
    .eq('status', 'PUBLISHED') // Ensure we only show PUBLISHED events
    .limit(5);

  if (query) dbQuery = dbQuery.ilike('title', `%${query}%`);

  const { data, error } = await dbQuery;
  if (error || !data || data.length === 0) return "No events found.";
  
  // Format cleanly for the AI to read
  return data.map((e, index) => {
    // @ts-ignore
    const types = e.ticket_types.map((t: any) => `${t.name}: R${t.price}`).join(', ');
    return `ID: ${index + 1} | Event: ${e.title} | Date: ${e.date} | Types: [${types}]`;
  }).join('\n');
}

async function generatePaymentLink(eventName: string, ticketType: string, quantity: number, customerName: string) {
  const total = 100 * quantity; // Mock calculation
  // Uses the environment variable for the backend URL or defaults to the deployed site
  const baseUrl = process.env.VITE_BACKEND_URL || 'https://sayhiafricatickets.netlify.app';
  return `LINK_GENERATED: ${baseUrl}/pay?amt=${total}&ref=${Date.now()}&name=${encodeURIComponent(customerName)}`;
}

// --- MAIN AGENT FUNCTION ---

const extractResponseText = (payload: any): string => {
  if (!payload) return '';
  if (typeof payload.text === 'function') return payload.text() || '';
  if (typeof payload.text === 'string') return payload.text;
  const response = payload.response ?? payload;
  if (Array.isArray(response?.candidates)) {
    const parts = response.candidates[0]?.content?.parts;
    if (Array.isArray(parts)) return parts.map((part: any) => part.text).filter(Boolean).join('\n');
  }
  return '';
};

const extractFunctionCalls = (payload: any) => {
  const response = payload?.response ?? payload;
  return response?.functionCalls || payload?.functionCalls || [];
};

export const processUserMessage = async (userMessage: string, userPhone: string): Promise<string> => {
  if (!genAI) return "Agent offline.";

  try {
    // Fixed: Use a valid model name
    const model = 'gemini-2.0-flash'; 
    
    // --- THIS IS THE KEY PART ---
    // We give the AI a "Script" to follow step-by-step.
    const systemInstruction = `
      Role: You are the helpful 'Say HI Africa' booking assistant.
      Goal: Guide the user through a ticket purchase one step at a time and always steer the chat back to ticket sales.
      Tone: Friendly, concise, professional. Use emojis sparingly (😊, ✅). If the user goes off-topic, acknowledge briefly and pivot back to choosing an event/tickets.

      STRICT CONVERSATION FLOW (Do not skip steps):
      
      1. **GREET & SHOW**: If the user says "Hi", call 'searchEvents'. 
         - Display ONLY the Event Names and Dates numbered 1, 2, 3. 
         - Do NOT list ticket prices yet.
         - Ask: "Which event number would you like to check out?"

      2. **TICKET TYPES**: When the user picks an event (e.g. "Option 1"), display the Ticket Types (General, VIP) and Prices for THAT event only.
         - Ask: "Which ticket type do you want?"

      3. **QUANTITY**: When they pick a type, ask: "How many tickets do you need?"

      4. **DETAILS**: When they give a number, ask: "Great! Please confirm your Name and Surname for the invoice."

      5. **PAYMENT**: When they give their name, call 'generatePaymentLink' with all the details.
         - Output: "Here is your secure link to pay: [Link]"
         - Closing: "Once payment is successful, we will WhatsApp you the tickets and invoice immediately! "

      Rules:
      - Ask ONE question at a time. Do not overwhelm the user.
      - If 'searchEvents' returns empty, apologize and say no shows are live.
      - If the user talks about anything else, politely redirect to buying tickets.
      - Do not get stuck in small talk; keep moving toward ticket selection and payment.
    `;

    // 1. First turn
    const result = await genAI.models.generateContent({
      model,
      contents: userMessage,
      config: { tools, systemInstruction }
    });

    const response = result;
    const functionCalls = extractFunctionCalls(response);
    
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
            args['quantity'] as number,
            args['customerName'] as string
          );
        }
        functionResponses.push({
            name, response: { result: functionResult }, id: call.id 
        });
      }

      // 2. Second turn (Feed tool output back)
      const secondResult = await genAI.models.generateContent({
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

      return extractResponseText(secondResult) || "Processing...";
    }

    return extractResponseText(response) || "How can I help?";

  } catch (error) {
    console.error("Agent Error:", error);
    return "System Error. Please try again.";
  }
};

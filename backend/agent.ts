import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const payfastMerchantId = process.env.PAYFAST_MERCHANT_ID || '10000100'; // Sandbox default
const payfastMerchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a'; // Sandbox default
const payfastReturnUrl = process.env.PAYFAST_RETURN_URL || 'https://sayhi.africa/pay/success';
const payfastCancelUrl = process.env.PAYFAST_CANCEL_URL || 'https://sayhi.africa/pay/cancel';
const payfastNotifyUrl = process.env.PAYFAST_NOTIFY_URL || 'http://localhost:3000/payfast/notify';
const frontendBaseUrl = process.env.FRONTEND_URL || 'https://sayhiafricatickets.netlify.app';

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
      quantity: { type: Type.NUMBER, description: 'Number of tickets.' },
      customerName: { type: Type.STRING, description: 'Customer full name for the invoice.' },
      customerEmail: { type: Type.STRING, description: 'Customer email for invoice/receipt.' }
    },
    required: ['eventName', 'ticketType', 'quantity', 'customerName', 'customerEmail']
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
type TicketTypeFull = { id: string; name: string; price: number };

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
    return `${index + 1}. ${event.title} (${event.date})`;
  }).join('\n');
}

const fetchEventWithTickets = async (eventName: string) => {
  if (!supabase) return null;
  const { data } = await supabase
    .from('events')
    .select('id,title,status,ticket_types(id,name,price)')
    .ilike('title', `%${eventName}%`)
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data as ({ id: string; title: string; status: string; ticket_types: TicketTypeFull[] } | null);
};

const createOrder = async (args: {
  eventId: string;
  total: number;
  quantity: number;
  ticketType: string;
  phone?: string;
  customerName?: string;
  customerEmail?: string;
}) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('orders')
    .insert({
      event_id: args.eventId,
      customer_name: args.customerName || 'WhatsApp User',
      customer_email: args.customerEmail || 'whatsapp@sayhi.africa',
      customer_phone: args.phone || 'unknown',
      total_amount: args.total,
      status: 'PENDING',
      channel: 'WHATSAPP',
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Order creation failed:', error);
    return null;
  }
  return data?.id as string | null;
};

const buildPayfastLink = (params: Record<string, string>) => {
  const search = new URLSearchParams(params);
  return `https://sandbox.payfast.co.za/eng/process?${search.toString()}`;
};

async function generatePaymentLink(eventName: string, ticketType: string, quantity: number, userPhone?: string, customerName?: string, customerEmail?: string) {
  // Default values for when Supabase is not configured
  let total = Math.max(1, quantity) * 100;
  let eventId: string | null = null;
  let ticketTypeId: string | null = null;

  if (supabase) {
    const event = await fetchEventWithTickets(eventName);
    if (event) {
      eventId = event.id;
      const ticketRow = Array.isArray(event.ticket_types)
        ? event.ticket_types.find((t) => t.name.toLowerCase() === ticketType.toLowerCase()) ?? event.ticket_types[0]
        : null;
      if (ticketRow) {
        ticketTypeId = ticketRow.id;
        total = Number(ticketRow.price || 0) * Math.max(1, quantity);
      }
      // Create order so webhook can mark it paid
      const orderId = await createOrder({
        eventId,
        total,
        quantity,
        ticketType,
        phone: userPhone,
        customerName,
        customerEmail,
      });
      if (orderId) {
        const link = buildPayfastLink({
          merchant_id: payfastMerchantId,
          merchant_key: payfastMerchantKey,
          amount: total.toFixed(2),
          item_name: `${eventName} x${quantity}`,
          return_url: payfastReturnUrl,
          cancel_url: payfastCancelUrl,
          notify_url: payfastNotifyUrl,
          custom_str1: orderId,
          custom_str2: eventName,
          custom_str3: ticketType,
          custom_str4: ticketTypeId || '',
          custom_int1: String(quantity),
        });

        return `PayFast checkout ready.\nEvent: ${eventName}\nTickets: ${quantity}x ${ticketType}\nTotal: R${total.toFixed(2)}\n\nPay here: ${link}\n\nOnce PayFast pings us, your QR tickets will arrive in this chat.`;
      }
    }
  }

  // Fallback (no Supabase or order creation failed)
  const fallbackLink = buildPayfastLink({
    merchant_id: payfastMerchantId,
    merchant_key: payfastMerchantKey,
    amount: total.toFixed(2),
    item_name: `${eventName} x${quantity}`,
    return_url: payfastReturnUrl,
    cancel_url: payfastCancelUrl,
    notify_url: payfastNotifyUrl,
    custom_str2: eventName,
    custom_str3: ticketType,
    custom_int1: String(quantity),
  });

  const webPayUrl = `${frontendBaseUrl.replace(/\/$/, '')}/pay?amt=${total.toFixed(2)}&ref=${Date.now()}&name=${encodeURIComponent(customerName || 'Customer')}&email=${encodeURIComponent(customerEmail || '')}`;

  return `PayFast checkout ready.\nEvent: ${eventName}\nTickets: ${quantity}x ${ticketType}\nTotal: R${total.toFixed(2)}\n\nPay here: ${webPayUrl}\n\nTickets will be sent after payment.`;
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
    
    const systemInstruction = `
      Role: You are the helpful "Say HI Africa" booking assistant.
      Goal: Guide the user through a ticket purchase one step at a time.
      Tone: Friendly, concise, professional. Use emojis sparingly (✅, 😊).

      STRICT CONVERSATION FLOW (do not skip steps):
      1) GREET & SHOW: If user says "Hi" or asks for events, call 'searchEvents'. Show ONLY event names and dates, numbered. Ask: "Which event number would you like?"
      2) TICKET TYPES: When the user picks an event (e.g., "1"), show ticket types and prices for that event only. Ask: "Which ticket type do you want?"
      3) QUANTITY: After they pick a type, ask: "How many tickets do you need?"
      4) DETAILS: After quantity, ask for BOTH: "Please confirm your Name & Surname, and your Email for the invoice."
      5) PAYMENT: When you have event + ticket type + quantity + customer name + email, call 'generatePaymentLink'. Reply with the PayFast link and say: "Once payment is successful, we'll WhatsApp your QR tickets and invoice immediately."

      Rules:
      - Ask ONE question at a time.
      - If 'searchEvents' returns empty, apologize and say no shows are live.
      - Never invent links; always use generatePaymentLink.
      - Keep replies short (WhatsApp style).
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
            args['quantity'] as number,
            userPhone,
            args['customerName'] as string
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

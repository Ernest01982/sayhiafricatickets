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

// 1. Initialize Supabase (only when credentials exist)
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// 2. Initialize Gemini
const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// --- TOOLS DEFINITION ---

// Tool 1: Search Events
const searchEventsDeclaration: FunctionDeclaration = {
  name: 'searchEvents',
  description: 'List active events.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search keyword.'
      }
    }
  }
};

// Tool 2: Check Ticket Status
const checkTicketDeclaration: FunctionDeclaration = {
  name: 'checkTicketStatus',
  description: 'Validate ticket ID/QR.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      ticketId: {
        type: Type.STRING,
        description: 'Ticket ID or QR string.'
      }
    },
    required: ['ticketId']
  }
};

const tools: Tool[] = [{
  functionDeclarations: [searchEventsDeclaration, checkTicketDeclaration]
}];

// --- EXECUTION FUNCTIONS ---

async function searchEvents(query?: string) {
  if (!supabase) {
    return 'Events unavailable. Configure Supabase.';
  }

  let dbQuery = supabase
    .from('events')
    .select('title, date, venue')
    .eq('status', 'PUBLISHED')
    .limit(3); // Limit results to save tokens

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  const { data, error } = await dbQuery;
  if (error || !data || data.length === 0) return "No events found.";
  
  // OPTIMIZATION: Return compact string instead of JSON to save tokens
  return data.map(e => `${e.title} | ${e.date} @ ${e.venue}`).join('\n');
}

async function checkTicketStatus(ticketId: string) {
  if (!supabase) {
    return 'Ticket validation unavailable. Configure Supabase.';
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('status, holder_name')
    .or(`id.eq.${ticketId},qr_code.eq.${ticketId}`)
    .single();

  if (error) return "Invalid Ticket.";
  // OPTIMIZATION: Concise status return
  return `Status: ${data.status} | Holder: ${data.holder_name}`;
}

// --- MAIN AGENT FUNCTION ---

const extractResponseText = (payload: any): string => {
  if (!payload) return '';

  if (typeof payload.text === 'function') {
    try {
      return payload.text() || '';
    } catch {
      // Ignore and try other shapes
    }
  }

  if (typeof payload.text === 'string') {
    return payload.text;
  }

  const response = payload.response ?? payload;
  if (typeof response?.text === 'function') {
    try {
      return response.text() || '';
    } catch {
      // Ignore
    }
  }

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

export const processUserMessage = async (userMessage: string, userPhone: string): Promise<string> => {
  if (!genAI) {
    return "Agent offline. Configure API_KEY on the server.";
  }

  try {
    const model = 'gemini-2.5-flash'; // Efficient model choice
    
    // OPTIMIZED SYSTEM INSTRUCTION: Non-conversational, strict functionality
    const systemInstruction = `
      Role: Automated Ticketing System.
      Rules:
      1. Do NOT be conversational. No "Hi", no "Here is".
      2. If intent is SEARCH, call searchEvents.
      3. If intent is CHECK TICKET, call checkTicketStatus.
      4. If intent is BUY, output: "Link: https://sayhi.africa/buy".
      5. Output ONLY the data or the link.
      6. Fallback: "Options: 1. Search Events 2. Check Ticket".
      Date: ${new Date().toISOString().split('T')[0]}.
    `;

    // 1. First turn
    const result = await genAI.models.generateContent({
      model,
      contents: userMessage,
      config: {
        tools,
        systemInstruction,
      }
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
        } else if (name === 'checkTicketStatus') {
          functionResult = await checkTicketStatus(args['ticketId'] as string);
        }

        functionResponses.push({
          name: name,
          response: { result: functionResult },
          id: call.id 
        });
      }

      // 2. Second turn (Feed tool output back to model)
      const secondResult = await genAI.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: userMessage }] },
          { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
          { role: 'function', parts: functionResponses.map(fr => ({ 
              functionResponse: { 
                name: fr.name, 
                response: fr.response 
              } 
            })) 
          }
        ],
        config: { tools } 
      });

      return extractResponseText(secondResult) || "Error processing request.";
    }

    // No function call, return text (which should be minimal based on instructions)
    return extractResponseText(response) || "Options: 1. Search Events 2. Check Ticket";

  } catch (error) {
    console.error("Agent Error:", error);
    return "System Error.";
  }
};

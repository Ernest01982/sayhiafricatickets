const normalizeBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Default to local backend port for dev environments
  return 'http://localhost:3000';
};

const normalizeEdgeUrl = () => {
  const explicit = import.meta.env.VITE_EDGE_FUNCTION_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;
  // Supabase functions live at *.functions.supabase.co
  const fnBase = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
  return `${fnBase}/whatsapp-sim`;
};

const API_BASE_URL = normalizeBaseUrl();
const EDGE_FUNCTION_URL = normalizeEdgeUrl();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const canUseGemini = Boolean(geminiApiKey);
const BACKEND_TIMEOUT_MS = 15000;

type SimState = {
  step?: string;
  eventId?: string;
  eventTitle?: string;
  ticketTypes?: Array<{ id: string; name: string; price: number }>;
  ticketType?: string | null;
  quantity?: number | null;
  name?: string | null;
  email?: string | null;
};

let simState: SimState = {};

interface ChatResponsePayload {
  response?: string;
  error?: string;
}

const parseGeminiText = (payload: any): string => {
  const candidates = payload?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return '';

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();
};

const generateWithGemini = async (apiKey: string, userMessage: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key missing.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const data = await response.json();
  const text = parseGeminiText(data);
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
};

export const processUserMessage = async (userMessage: string): Promise<string> => {
  if (!userMessage.trim()) {
    return '';
  }

  // Preferred: hit Supabase Edge Function to keep secrets server-side.
  if (EDGE_FUNCTION_URL && supabaseAnonKey) {
    try {
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ message: userMessage, phone: 'simulator', state: simState }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Function error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      if (data?.state) {
        simState = data.state as SimState;
      }
      if (data?.response) return data.response as string;
    } catch (fnError) {
      console.error('Edge function failed, falling back:', fnError);
    }
  }

  // Try hitting Gemini directly to simulate bot responses inside the admin console.
  if (canUseGemini) {
    try {
      return await generateWithGemini(geminiApiKey as string, userMessage);
    } catch (geminiError) {
      console.error('Gemini simulation failed, falling back to backend:', geminiError);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = `Chat service failed (${response.status})`;
      try {
        const errorPayload: ChatResponsePayload = await response.json();
        if (errorPayload?.error) {
          errorMessage = errorPayload.error;
        }
      } catch {
        // Ignore JSON parsing errors, keep default message
      }
      throw new Error(errorMessage);
    }

    const data: ChatResponsePayload = await response.json();
    if (!data?.response) {
      throw new Error('Unexpected response from backend agent.');
    }

    return data.response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Connection to agent timed out.');
    }
    throw new Error(error?.message || 'Failed to reach AI agent.');
  } finally {
    clearTimeout(timeout);
  }
};

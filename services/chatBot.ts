const normalizeBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Default to local backend port for dev environments
  return 'http://localhost:3000';
};

const API_BASE_URL = normalizeBaseUrl();
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const canUseGemini = Boolean(geminiApiKey);
const BACKEND_TIMEOUT_MS = 15000;

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

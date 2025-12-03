const normalizeBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Default to local backend port for dev environments
  return 'http://localhost:3000';
};

const API_BASE_URL = normalizeBaseUrl();

interface ChatResponsePayload {
  response?: string;
  error?: string;
}

export const processUserMessage = async (userMessage: string): Promise<string> => {
  if (!userMessage.trim()) {
    return '';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

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

    const message = error?.message || '';
    const isNetworkRefused =
      error?.name === 'TypeError' ||
      message.toLowerCase().includes('failed to fetch') ||
      message.toLowerCase().includes('networkerror') ||
      message.toLowerCase().includes('connection refused');

    if (isNetworkRefused) {
      throw new Error(
        `Cannot reach the agent service. Please start the backend on ${API_BASE_URL} and keep VITE_BACKEND_URL pointed there.`
      );
    }

    throw new Error(message || 'Failed to reach AI agent.');
  } finally {
    clearTimeout(timeout);
  }
};

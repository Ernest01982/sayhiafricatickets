import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

// Safely initialize Gemini only when needed to avoid errors if key is missing during initial load
const getAiClient = () => {
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled or mock responses used.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMarketingMessage = async (
  eventTitle: string, 
  tone: 'urgent' | 'exciting' | 'formal', 
  details: string
): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    return "Error: API Key missing. Please configure your API key to use the Smart Composer.";
  }

  try {
    const prompt = `
      You are a marketing expert for a WhatsApp-native ticketing platform.
      Write a short, engaging WhatsApp broadcast message (under 100 words) for an event.
      
      Event: ${eventTitle}
      Tone: ${tone}
      Extra Details: ${details}
      
      Include emojis. Keep it punchy. No hashtags.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate content. Please try again later.";
  }
};

export const analyzeMessagingCost = async (messageCount: number, activeCampaigns: number): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Analysis unavailable without API Key.";

    try {
         const prompt = `
            You are a financial analyst for an event platform.
            Given:
            - ${messageCount} utility messages sent via WhatsApp API.
            - ${activeCampaigns} marketing campaigns run.
            
            Provide a 1-sentence strategic insight on how to optimize messaging costs for the next event.
         `;
         
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text || "Analysis complete.";
    } catch (e) {
        return "Could not analyze costs.";
    }
}
import { GoogleGenAI } from "@google/genai";

const COACH_SYSTEM_INSTRUCTION = `
You are a supportive social skills coach for neurodivergent individuals.

Your role:
- Provide practical, actionable advice on social situations
- Help users prepare for upcoming interactions
- Explain social norms and unspoken rules clearly
- Roleplay conversations if requested
- Be patient, encouraging, and non-judgmental
- Use clear, direct language without metaphors

Guidelines:
- Keep responses concise (2-4 sentences for quick questions)
- Provide specific examples when possible
- Acknowledge that social rules can be confusing
- Validate the user's experiences
- Offer multiple approaches when relevant

Style:
- Warm and supportive but not overly casual
- Clear and structured
- Avoid idioms and abstract language
- Use bullet points for multiple steps
`;

export const sendCoachMessage = async (
  message: string,
  conversationHistory: { role: 'user' | 'bot', text: string }[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Build conversation context
    const context = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Coach'}: ${msg.text}`)
      .join('\n\n');

    const prompt = context
      ? `${context}\n\nUser: ${message}\n\nCoach:`
      : `User: ${message}\n\nCoach:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    return response.text || "I'm here to help! Could you tell me more about your situation?";
  } catch (error) {
    console.error('Coach service error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

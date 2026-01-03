
import { GoogleGenAI, Type } from "@google/genai";
import { Mode, DetailLevel, AnalysisResult } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const analyzeMessage = async (
  message: string,
  mode: Mode,
  detailLevel: DetailLevel,
  image?: { data: string; mimeType: string },
  audio?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  // Always use a named parameter and obtain the API key exclusively from the environment variable.
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY });
  
  const prompt = `
    Analyze this message in the context of ${mode}.
    Verbosity level: ${detailLevel}.
    ${image ? 'The input includes an image. Analyze any text found or the social situation depicted.' : ''}
    ${audio ? 'The input includes an audio recording. Please transcribe and analyze the spoken message and its social subtext.' : ''}
    Input Message Text: "${message}"
  `;

  const parts: any[] = [{ text: prompt }];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }
  if (audio) {
    parts.push({
      inlineData: {
        data: audio.data,
        mimeType: audio.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          whatWasSaid: { type: Type.STRING },
          whatIsExpected: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatIsOptional: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatCarriesRisk: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatIsNotAskingFor: { type: Type.ARRAY, items: { type: Type.STRING } },
          hiddenRules: { type: Type.ARRAY, items: { type: Type.STRING } },
          clarityScore: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["score", "explanation"]
          },
          confidenceLevel: { type: Type.STRING },
          responses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                wording: { type: Type.STRING },
                toneDescription: { type: Type.STRING },
                socialImpact: { type: Type.STRING },
                riskLevel: { type: Type.INTEGER }
              },
              required: ["type", "wording", "toneDescription", "socialImpact", "riskLevel"]
            }
          }
        },
        required: [
          "whatWasSaid", "whatIsExpected", "whatIsOptional", 
          "whatCarriesRisk", "whatIsNotAskingFor", "hiddenRules", 
          "clarityScore", "confidenceLevel", "responses"
        ]
      }
    }
  });

  const rawJson = JSON.parse(response.text || '{}');
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    mode,
    originalMessage: message || (audio ? "Audio message" : "Image analysis"),
    ...rawJson
  } as AnalysisResult;
};


import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const callGeminiAPI = async (prompt: string, systemInstruction: string, maxRetries = 3): Promise<string> => {
    if (!API_KEY) {
        return "오류: Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하세요.";
    }

    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            // FIX: The `systemInstruction` property should be inside a `config` object, and the `contents` should be a simple string.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                },
            });
            
            return response.text;

        } catch (error) {
            console.error(`Gemini API call attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) {
                return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
    return "죄송합니다. 답변을 생성하는 데 실패했습니다.";
};

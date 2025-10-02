import { GoogleGenAI } from "@google/genai";

// Fix: The method for accessing the API key was non-compliant with @google/genai guidelines and caused a TypeScript error.
// It has been updated to use `process.env.API_KEY` as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const callGeminiAPI = async (prompt: string, systemInstruction: string, maxRetries = 3): Promise<string> => {
    if (!process.env.API_KEY) {
        return "오류: Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하세요.";
    }

    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
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

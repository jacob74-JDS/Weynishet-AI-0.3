
import { GoogleGenAI, Chat, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = "You are Weynishet, an expert AI assistant specializing in trading (including stocks, crypto, and forex), information technology (covering software development, cybersecurity, and cloud computing), and digital marketing (SEO, content marketing, and social media strategies). Provide clear, concise, and accurate information on these topics. Be helpful and professional.";

let ai: GoogleGenAI;
let chat: Chat;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const startChat = (): void => {
    const genAI = getAI();
    chat = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
};

export const sendMessage = async (message: string): Promise<string> => {
    if (!chat) {
        throw new Error("Chat not initialized. Call startChat first.");
    }
    try {
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};

export const textToSpeech = async (text: string): Promise<string | null> => {
    try {
        const genAI = getAI();
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        return null;

    } catch (error) {
        console.error("Text-to-speech error:", error);
        return null;
    }
};

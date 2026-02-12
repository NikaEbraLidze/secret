import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFlowerPoem = async (colors: string[]): Promise<string> => {
  try {
    const prompt = `
      A girl named Tati just selected these 5 colors for her digital flower garden: ${colors.join(', ')}.
      Write a single, short, charming sentence (max 12 words) about why these colors look nice together or match a cool vibe.
      
      Constraint: 
      - Keep it friendly, stylish, and warm. 
      - DO NOT use words like "love", "soul", "passion", "forever", "heart".
      - DO NOT be overly romantic.
      - Make it sound like a compliment on her good taste.
      - Lowercase.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "colors that shine with a lovely energy.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "a wonderful palette with great vibes.";
  }
};
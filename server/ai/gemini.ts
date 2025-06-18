import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function getGeminiResponse(prompt: string) {
  try {
    console.log("Sending prompt to Gemini:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received reply from Gemini:", text);
    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

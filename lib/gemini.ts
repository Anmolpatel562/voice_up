import { GoogleGenerativeAI } from "@google/generative-ai";

export async function geminiCall(
  prompt: string,
  responseMimeType?: string
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: responseMimeType
      ? {
          responseMimeType,
        }
      : undefined,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function geminiCall(
  prompt: string,
  responseMimeType?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: responseMimeType
      ? { responseMimeType }
      : undefined,
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;

      console.error(
        `Gemini request failed (attempt ${attempt}/3)`,
        {
          status: error?.status,
          message: error?.message,
        }
      );

      // Retry only for temporary service issues
      if (error?.status !== 503) {
        throw error;
      }

      // Wait 2s, 4s, 6s between retries
      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 2000)
      );
    }
  }

  throw lastError;
}
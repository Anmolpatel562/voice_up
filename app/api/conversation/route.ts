import { geminiCall } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { transcript, history } = await request.json();
    if (!transcript) {
      return Response.json(
        { message: "Transcript not found!" },
        { status: 400 },
      );
    }
    if (!history) {
      return Response.json({ message: "History not found!" }, { status: 400 });
    }
    const prompt = `You are a friendly English speaking partner. Conversation so far: ${JSON.stringify(history)} User just said: "${transcript}"
                    Respond naturally in 2-3 sentences.Keep it conversational.`;
    const response = await geminiCall(prompt);
    return Response.json(
      {
        response: response || "",
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Conversation API Error:", error);
    if (error?.status === 503) {
      return Response.json(
        {
          message:
            "AI service is currently busy. Please try again in a few seconds.",
        },
        {
          status: 503,
        },
      );
    }
    return Response.json(
      {
        message: "Something went wrong in conversation api",
      },
      {
        status: 500,
      },
    );
  }
}

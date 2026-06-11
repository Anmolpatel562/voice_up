import { geminiCall } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const { transcript, history } = await request.json();
        if (!transcript) return Response.json({ message: "Transcript not found!" }, { status: 400 });
        if (!history) return Response.json({ message: "History not found" }, { status: 400 });
        const prompt = `You are a friendly English speaking partner. 
                        Conversation so far: ${JSON.stringify(history)}
                        User just said: "${transcript}"
                        Respond naturally in 2-3 sentences. Keep it conversational.`
        const response = await geminiCall(prompt);
        if (!response) return Response.json({response: ""}, {status:200});
        return Response.json({response: response}, {status:200});
    }
    catch (error) {
        console.log("Error : ", error);
        return Response.json({ message: "Something went wrong in conversation api" }, { status: 500 });
    }
}
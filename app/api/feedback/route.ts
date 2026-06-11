import { geminiCall } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST (request: Request) {
    try {
        const { sessionId, transcript } = await request.json();
        if (!sessionId) return Response.json({message:"Session Id not found!"}, {status: 400});
        if (!transcript) return Response.json({message:"Transcript not found!"}, {status: 400});
        console.log("transacript ==> ", transcript);
        const prompt = `Here is the conversation transcript: ${JSON.stringify(transcript)}
                        Analyze only the user's messages and return JSON only, no markdown, no backticks:
                        {
                          "grammarMistakes": [{"original": "", "corrected": "", "explanation": ""}],
                          "fillerWords": {"count": 0, "words": []},
                          "vocabularySuggestions": [{"used": "", "alternatives": []}],
                          "overallFeedback": ""
                        }`
        const data = await geminiCall(prompt, "application/json");
        console.log("data ==> ", data);
        const responseObj = JSON.parse(data?data:"");
        const newFeedbackObj = await prisma.feedback.create({
            data: {
              sessionId: sessionId,
              grammarMistakes: responseObj.grammarMistakes,
              fillerWords: responseObj.fillerWords,
              vocabularySuggestions: responseObj.vocabularySuggestions,
              overallFeedback: responseObj.overallFeedback
            }
        })
        return Response.json({ feedback: newFeedbackObj }, { status: 201 })
    } 

    catch (error) {
        console.log("Error : ", error);
        return Response.json({message: "Something went wrong in feedback api!"}, {status:500});
    }
}
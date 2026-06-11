import { prisma } from "@/lib/prisma";

export async function GET (
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }){
    try {
        const { sessionId } = await params;
        if (!sessionId) return Response.json({message:"Session Id not found"}, {status:400});
        const response = await prisma.feedback.findUnique({
            where:{ sessionId:sessionId}
        })
        if (!response) return Response.json({message: "Feedback not found"}, {status: 404})
        return Response.json({response:response}, {status:200});
    } 
    catch (error) {
        console.log("Error : ", error);
        return Response.json({message: "Something went wrong!"}, {status:500})
    }
}
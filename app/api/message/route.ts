import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { sessionId, role, text } = await request.json();
        if (!sessionId) return Response.json({message: "Session id not found!"},{status:400})
        if (!role) return Response.json({message: "Role not found!"},{status:400})
        if (!text) return Response.json({message: "Not text found!"},{status:400})
        const newMessage = await prisma.message.create({
            data: {
                sessionId: sessionId,
                role: role,
                text: text
            }
        });
        return Response.json({messageId: newMessage.id},{status:201});
    }
    catch (error) {
        console.log("Error : ", error);
        return Response.json({message:"Something went wrong!"},{status:500}); 
    }
}
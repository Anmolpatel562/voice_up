import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return Response.json({message: "UnAuthorized"}, {status: 401});
        const newSession = await prisma.appSession.create({
            data: {
                userId: session.user.id,
                duration: 0
            }
        });
        return Response.json({  sessionId: newSession.id, message: "Session Created Successfully"}, {status: 201});
    } catch (error) {
        console.log("Error : ", error);
        return Response.json({ message: "Something went wrong while creating the session."}, { status:500 });
    }
}

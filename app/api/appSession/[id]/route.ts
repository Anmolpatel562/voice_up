import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request,  { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { duration } = await request.json();
        if (duration === undefined) return Response.json({message: "Duration not found!"}, {status: 400})
        if (!id) return Response.json({message: "App Session Id not found!"}, {status:400});
        const updatedAppSession = await prisma.appSession.update({
            where:{id:id},
            data: {
                duration:duration
            }
        });
        return Response.json({message:"App Session Updated Successfully"}, {status:200});
    }
    catch (error) {
        console.log("Error : ", error);
        return Response.json({message: "Something went wrong in appSession patch"}, {status: 500});
    }
}
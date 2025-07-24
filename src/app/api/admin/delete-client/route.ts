import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async(req: NextRequest) => {
  try {
    const { clientId } = await req.json();

    if(!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const client  = await prisma.user.findUnique({ where: { id: clientId } });

    if(!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: clientId },
      data: {
        status: "inactive"
      }
    })

    return NextResponse.json({
      success: true,
      message: "Client deactivated successfully"
    });
  } catch (error) {
    console.error("[Delete Client Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async(req: NextRequest) => {
  try {
    const body = await req.json();
    let { clientMemberId } = body;

    if (!clientMemberId) {
      return NextResponse.json(
        { success: false, message: "Missing clientMemberId" },
        { status: 400 }
      );
    }

    clientMemberId = Number(clientMemberId);
    if (isNaN(clientMemberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid clientMemberId" },
        { status: 400 }
      );
    }

    const gameuids = await prisma.gameSession.findMany({
      where: {
        clientMemberId,
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ gameuids });
  } catch (error) {
    console.error("Error fetching game uids:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as any).message },
      { status: 500 }
    );
  }
}
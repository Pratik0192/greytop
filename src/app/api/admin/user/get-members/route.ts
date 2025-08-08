import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async(req: NextRequest) => {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const members = await prisma.clientMember.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching client members:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as any).message },
      { status: 500 }
    );
  }
}
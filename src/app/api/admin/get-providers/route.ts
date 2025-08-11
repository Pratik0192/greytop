import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const providers = await prisma.gameProvider.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as any).message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await req.json();

    if(!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const client = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true }
    })

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    let { clientMemberId } = body;

    if(!clientMemberId) {
      return NextResponse.json(
        { success: false, message: "Missing clientMemberId" },
        { status: 400 }
      );
    }

    clientMemberId = Number(clientMemberId);
    if (isNaN(clientMemberId)) {
      return NextResponse.json({ success: false, message: "Invalid clientMemberId" }, { status: 400 });
    }

    const member = await prisma.clientMember.findUnique({
      where:{ id: clientMemberId },
      select: { id: true, memberAccount: true }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
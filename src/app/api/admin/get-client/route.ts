import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export const POST = async(req: NextRequest) => {
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        apiKey: true,
        status: true,
        whitelistedIps: true,
        providersAllowed: true,
        createdAt: true
      }
    })

    return NextResponse.json({ success: true, clients })
  } catch (error) {
    console.error("[Get Clients Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
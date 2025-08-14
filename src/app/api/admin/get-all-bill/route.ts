import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const bills = await prisma.monthlyBill.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        providers: true,
      }
    })

    return NextResponse.json({ bills });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
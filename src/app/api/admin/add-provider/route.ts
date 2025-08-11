import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function generateUniqueProviderId() {
  let id: string;
  let exists = true;

  do {
    id = Math.floor(100 + Math.random() * 900).toString();
    const existing = await prisma.gameProvider.findUnique({ where: { id } });
    exists = !!existing;
  } while (exists);

  return id;
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, ggrPercent } = body;

    if (!name || !ggrPercent) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const id = await generateUniqueProviderId();

    const newProvider = await prisma.gameProvider.create ({
        data: { id, name, ggrPercent },
    });

    return NextResponse.json({ success: true, provider: newProvider });
  } catch (error) {
    console.error("Error adding provider:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as any).message },
      { status: 500 }
    );
  }
}
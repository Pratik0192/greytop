import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function generateUniqueGameId() {
  let id: string;
  let exists = true;

  do {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await prisma.game.findUnique({ where: { id } });
    exists = !!existing;
  } while (exists);

  return id;
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, gameUid, types, gameProviderId } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Missing required field: name" },
        { status: 400 }
      );
    }

    if (!gameUid) {
      return NextResponse.json(
        { success: false, message: "Missing required field: gameUid" },
        { status: 400 }
      );
    }

    if (!types) {
      return NextResponse.json(
        { success: false, message: "Missing required field: types" },
        { status: 400 }
      );
    }

    if (!gameProviderId) {
      return NextResponse.json(
        { success: false, message: "Missing required field: gameProviderId" },
        { status: 400 }
      );
    }


    if (typeof gameProviderId !== "string" || gameProviderId.length !== 3 || !/^\d+$/.test(gameProviderId)) {
      return NextResponse.json({ success: false, message: "Game Provider ID must be exactly 3 digits" }, { status: 400 });
    }

    const provider = await prisma.gameProvider.findFirst({ 
      where: { 
        id: gameProviderId
      }
    })

    if (!provider) {
      return NextResponse.json({ success: false, message: "Game Provider not found" }, { status: 404 });
    }

    const id = await generateUniqueGameId();

    const newGame = await prisma.game.create({
      data: { id, name, gameUid, types, gameProviderId },
    })

    return NextResponse.json({ success: true, game: newGame });
  } catch (error) {
    console.error("Error adding game:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as any).message },
      { status: 500 }
    );
  }
}
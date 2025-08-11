import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { gameProviderId } = body;

    if (!gameProviderId || typeof gameProviderId !== "string" || gameProviderId.length !== 3) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Game Provider ID" },
        { status: 400 }
      );
    }

    const provider = await prisma.gameProvider.findUnique({
      where: { id: gameProviderId },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Game Provider not found" },
        { status: 404 }
      );
    }

    const games = await prisma.game.findMany({
      where: { gameProviderId },
    });

    return NextResponse.json({
      success: true,
      provider: { id: provider.id, name: provider.name },
      games,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as any).message },
      { status: 500 }
    );
  }
}
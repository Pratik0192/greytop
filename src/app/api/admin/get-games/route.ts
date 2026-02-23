import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const gameProviderId = searchParams.get("gameProviderId");
    const name = searchParams.get("name");

    if (!gameProviderId || gameProviderId.length !== 3) {
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
      where: {
        gameProviderId,
        ...(name && {
          name: {
            contains: name,
            mode: "insensitive",
          },
        }),
      },
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
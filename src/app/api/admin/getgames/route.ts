import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const platforms = await prisma.gamePlatform.findMany({
      include: {
        games: {
          select: {
            gameName: true,
            uid: true,
            type: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(platforms);
  } catch (err) {
    console.error("[Get All Games Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
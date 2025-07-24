import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    for (const platformObj of data) {
      const { platform, games } = platformObj;

      const existingPlatform = await prisma.gamePlatform.findFirst({
        where: { name: platform }
      })

      let platformId = existingPlatform?.id;

      if(!platformId) {
        const createdPlatform = await prisma.gamePlatform.create({
          data: { name: platform },
        });
        platformId = createdPlatform.id;
      }

      for (const game of games) {
        const { gameName, uid, type } = game;

        const existingGame = await prisma.game.findUnique({ where: {uid} });

        if(!existingGame) {
          await prisma.game.create({
            data: {
              gameName,
              uid,
              type,
              platformId,
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: "Games added successfully" })
  } catch (err) {
    console.error("[Add Games Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { decryptAES } from "@/lib/aes";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const POST = async (req: NextRequest) => {
  console.log("callback called");
  
  try {
    const body = await req.json();

    const {
      timestamp,
      payload
    } = body;

    if(!payload) {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      );
    }

    const decryptedText = decryptAES(payload);

    let decryptedJson;
    try {
      decryptedJson = JSON.parse(decryptedText);
    } catch (error) {
      console.error("[CALLBACK] Failed to parse decrypted payload:", decryptedText);
      return NextResponse.json(
        { error: "Invalid decrypted payload format" },
        { status: 400 }
      );
    }

    console.log("[CALLBACK] Timestamp:", timestamp);
    console.log("[CALLBACK] Decrypted payload:", decryptedJson);

    const {
      serial_number,
      game_uid,
      game_round,
      bet_amount,
      win_amount,
      member_account,
      currency_code,
      timestamp: gameTimestamp,
    } = decryptedJson;

    const matchingSession = await prisma.gameSession.findFirst({
      where: {
        gameUid: game_uid,
        clientMember: {
          memberAccount: member_account
        }
      },
      select: { id: true }
    })

    if (!matchingSession) {
      console.warn(`[CALLBACK] No matching GameSession found for gameUid=${game_uid}, memberAccount=${member_account}`);
    }

    await prisma.gameHistory.upsert({
      where: { serialNumber: serial_number },
      update: {},
      create: {
        serialNumber: serial_number,
        gameUid: game_uid,
        gameRound: game_round,
        betAmount: new Prisma.Decimal(bet_amount),
        winAmount: new Prisma.Decimal(win_amount),
        memberAccount: member_account,
        currencyCode: currency_code,
        callbackTime: new Date(`${gameTimestamp} UTC`),
        gameSessionId: matchingSession?.id || null
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALLBACK] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
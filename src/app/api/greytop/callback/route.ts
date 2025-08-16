import { NextRequest, NextResponse } from "next/server";
import { decryptAES } from "@/lib/aes";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const POST = async (req: NextRequest) => {
  console.log("callback called");
  
  try {
    const body = await req.json();
    const { timestamp, payload } = body;

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

    const bet = new Prisma.Decimal(bet_amount);
    const win = new Prisma.Decimal(win_amount);
    const diff = bet.minus(win);

    const profitValue = diff.gt(0) ? diff : new Prisma.Decimal(0);
    const lossValue = diff.lt(0) ? diff.abs() : new Prisma.Decimal(0);

    const matchingSession = await prisma.gameSession.findFirst({
      where: {
        gameUid: game_uid,
        clientMember: {
          memberAccount: member_account
        }
      },
      select: { 
        id: true,
        providerCode: true,
        callbackUrl: true,
        clientMember: {
          select: { userId: true }
        }
      }
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
        profit: profitValue,
        loss: lossValue,
        memberAccount: member_account,
        currencyCode: currency_code,
        callbackTime: new Date(`${gameTimestamp} UTC`),
        gameSessionId: matchingSession?.id || null
      },
    });

    if(matchingSession?.clientMember?.userId && matchingSession?.providerCode) {
      await prisma.providerProfit.upsert({
        where: {
          providerCode_userId: {
            providerCode: matchingSession.providerCode,
            userId: matchingSession.clientMember.userId
          }
        },
        update: {
          profit: { increment: profitValue },
          loss: { increment: lossValue }
        },
        create: {
          providerCode: matchingSession.providerCode,
          userId: matchingSession.clientMember.userId,
          profit: profitValue,
          loss: lossValue,
        }
      });
    }

    if(matchingSession?.callbackUrl) {
      try {
        await fetch(matchingSession.callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp, payload }),
        });
        console.log(
          `[CALLBACK] Forwarded to client callback: ${matchingSession.callbackUrl}`
        );
      } catch (forwardErr) {
        console.error(
          `[CALLBACK] Failed to forward callback to ${matchingSession.callbackUrl}:`,
          forwardErr
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALLBACK] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
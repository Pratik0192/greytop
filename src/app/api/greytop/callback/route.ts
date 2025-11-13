import { NextRequest, NextResponse } from "next/server";
import { decryptAES, encryptAES } from "@/lib/aes";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { timestamp, payload } = body;

    if (!payload) {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      );
    }

    const decryptedText = decryptAES(payload);

    let data;
    try {
      data = JSON.parse(decryptedText);
    } catch (error) {
      console.error("[CALLBACK] Failed to parse decrypted payload:", decryptedText);
      return NextResponse.json(
        { error: "Invalid decrypted payload format" },
        { status: 400 }
      );
    }

    const {
      serial_number,
      game_uid,
      game_round,
      bet_amount,
      win_amount,
      member_account,
      currency_code,
      timestamp: gameTimestamp,
    } = data;

    const bet = new Prisma.Decimal(bet_amount || "0");
    const win = new Prisma.Decimal(win_amount || "0");

    //Get session in the first query
    const session = await prisma.gameSession.findFirst({
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
        creditAmount: true,
        clientMember: {
          select: { userId: true }
        }
      }
    });

    const currentBalance = new Prisma.Decimal(session?.creditAmount || "0");
    const updatedBalance = currentBalance.minus(bet).plus(win);

    //-------------------------SEND RESPONSE FIRST------------------------------//
    const responsePayload = {
      credit_amount: updatedBalance.toString(),
      timestamp: Date.now().toString(),
    }

    const encryptedPayload = encryptAES(JSON.stringify(responsePayload));

    const fastResponse = NextResponse.json({
      code: 0,
      msg: "",
      payload: encryptedPayload,
    });

    //--------------------------BACKGROUND TASKS------------------------------//

    (async () => {
      try {
        const diff = bet.minus(win);
        const profitValue = diff.gt(0) ? diff : new Prisma.Decimal(0);
        const lossValue = diff.lt(0) ? diff.abs() : new Prisma.Decimal(0);

        //Insert history
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
            gameSessionId: session?.id || null
          },
        });

        //Update the provider profit
        if (session?.clientMember?.userId && session?.providerCode) {
          await prisma.providerProfit.upsert({
            where: {
              providerCode_userId: {
                providerCode: session.providerCode,
                userId: session.clientMember.userId
              }
            },
            update: {
              profit: { increment: profitValue },
              loss: { increment: lossValue }
            },
            create: {
              providerCode: session.providerCode,
              userId: session.clientMember.userId,
              profit: profitValue,
              loss: lossValue,
            }
          });
        }

        //Update the session balance
        if (session?.id) {
          await prisma.gameSession.update({
            where: { id: session.id },
            data: { creditAmount: updatedBalance.toString() }
          })
        }

        //Forward request to the client
        if (session?.callbackUrl) {
          try {
            await fetch(session.callbackUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ timestamp, payload }),
            });
          } catch (forwardErr) {
            console.error(
              `[CALLBACK] Failed to forward callback to ${session.callbackUrl}:`,
              forwardErr
            );
          }
        }
      } catch (backgroundErr) {
        console.error("Background callback error:", backgroundErr);
      }
    })();

    return fastResponse;
  } catch (error) {
    console.error("[CALLBACK] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
};
import { encryptAES } from "@/lib/aes";
import { NextRequest, NextResponse } from "next/server";
import { CALLBACK_URL } from "../Launch/route";
import { prisma } from "@/lib/prisma";

const PLAYER_PREFIX = process.env.PLAYER_PREFIX!; 

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log("[CALLBACK] Incoming request body:", body);

    const {
      serial_number,
      currency_code = 'INR',
      game_uid,
      member_account,
      win_amount,
      bet_amount,
      data,
    } = body;

    if(!serial_number || !currency_code || !game_uid || !member_account || !win_amount || !bet_amount || !data) {
      console.warn("[CALLBACK] Missing required fields");
      return NextResponse.json({ code: 1, msg: "Missing required fields" });
    }

    const timestamp = Date.now().toString();

    const payloadObject = {
      serial_number,
      currency_code,
      game_uid,
      member_account: `${PLAYER_PREFIX}${member_account}`,
      win_amount,
      bet_amount,
      timestamp,
      data
    }

    console.log("[CALLBACK] Prepared payload to forward:", payloadObject);

    const downstream = await prisma.gameLaunchLog.findFirst({
      where: { memberAccount: member_account }
    })

    if (!downstream) {
      console.log("[CALLBACK] No downstream entry found for:", member_account);
      return NextResponse.json({ code: 1, msg: "Client callback URL not found" });
    }

    const downstreamCallbackUrl = downstream?.callbackUrl;

    if (!downstreamCallbackUrl) {
      console.log("[CALLBACK] Callback URL missing in DB for:", member_account);
      return NextResponse.json({ code: 1, msg: "Client callback URL not found" });
    }

    console.log("[CALLBACK] Forwarding to client callback URL:", downstreamCallbackUrl);

    const payloadString = JSON.stringify(payloadObject);
    const encryptedPayload = encryptAES(payloadString);

    const clientResponse = await fetch(downstreamCallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp,
        payload: encryptedPayload,
      })
    })

    console.log("[CALLBACK] Client responded with status:", clientResponse.status);

    const clientData = await clientResponse.json();

    console.log("[CALLBACK] Response from client:", clientData);

    const {
      code = 1,
      msg = "Unknown error",
      payload: clientPayload
    } = clientData

    return NextResponse.json({
      code,
      msg,
      payload: clientPayload ?? ""
    })
    
  } catch (error) {
    console.error("[CALLBACK] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
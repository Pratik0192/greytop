//transfer

import { NextRequest, NextResponse } from "next/server";
import { encryptAES } from "@/lib/aes";
import { verifyClient } from "@/lib/verifyClient";

const SERVER_URL = process.env.SERVER_URL!;
const AGENCY_UID = process.env.AGENCY_UID!;
const PLAYER_PREFIX = process.env.PLAYER_PREFIX!; 

export const POST = async (req: NextRequest) => {
  const auth = await verifyClient(req);
  if(!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const {
      member_account,
      game_uid,
      credit_amount,
      currency_code = 'USD',
      language = 'en',
      home_url,
      platform = 1,
      transfer_id,
    } = await req.json();

    if (!member_account || credit_amount === undefined || !currency_code || !transfer_id) {
      return NextResponse.json(
        {
          error:
            'member_account, credit_amount, currency_code, and transfer_id are required.',
        },
        { status: 400 }
      );
    }

    const timestamp = Date.now().toString();

    const payloadObject = {
      agency_uid: AGENCY_UID,
      member_account: `${PLAYER_PREFIX}${member_account}`,
      game_uid,
      timestamp,
      credit_amount,
      currency_code,
      language,
      home_url,
      platform,
      transfer_id
    }

    const payloadString = JSON.stringify(payloadObject);
    const encryptedPayload = encryptAES(payloadString);

    const upstreamResponse = await fetch(`${SERVER_URL}/game/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agency_uid: AGENCY_UID,
        timestamp,
        payload: encryptedPayload,
      }),
    });

    const responseData = await upstreamResponse.json();

    return NextResponse.json({
      status: upstreamResponse.status,
      data: responseData,
    });

  } catch (error) {
    console.error("Error in /api/greytop/launch2:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: (error as any).message,
      },
      { status: 500 }
    );
  }
}
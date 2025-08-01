import { encryptAES } from "@/lib/aes";
import { verifyClient } from "@/lib/verifyClient";
import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL!;
const AGENCY_UID = process.env.AGENCY_UID!;

export const POST = async (req:NextRequest) => {
  const auth = await verifyClient(req);
  if(!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const {
      from_date,
      to_date,
      page_no,
      page_size
    } = await req.json();

    if(!from_date) {
      return NextResponse.json(
        { error: "from_date is not present" },
        { status: 400 }
      )
    }

    if(!to_date) {
      return NextResponse.json(
        { error: "to_date is not present" },
        { status: 400 }
      )
    }

    if(!page_no) {
      return NextResponse.json(
        { error: "page_no is not present" },
        { status: 400 }
      )
    }

    if(!page_size) {
      return NextResponse.json(
        { error: "page_size is not present" },
        { status: 400 }
      )
    }

    const timestamp = Date.now().toString();

    const payloadObject = {
      timestamp,
      agency_uid: AGENCY_UID,
      from_date,
      to_date,
      page_no,
      page_size
    }

    const payloadString = JSON.stringify(payloadObject);
    const encryptedPayload = encryptAES(payloadString);

    const upstreamPesponse = await fetch(`${SERVER_URL}/game/transaction/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agency_uid: AGENCY_UID,
        timestamp,
        payload: encryptedPayload,
      })
    })

    const responseData = await upstreamPesponse.json();

    return NextResponse.json({
      status: upstreamPesponse.status,
      data: responseData
    })

  } catch (error) {
    console.error('Error in /api/transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
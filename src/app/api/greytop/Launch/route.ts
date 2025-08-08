// seamless

import { NextRequest, NextResponse } from 'next/server';
import { encryptAES } from '@/lib/aes';
import { verifyClient } from '@/lib/verifyClient';
import { prisma } from '@/lib/prisma';

const SERVER_URL = process.env.SERVER_URL!;
const AGENCY_UID = process.env.AGENCY_UID!;
const PLAYER_PREFIX = process.env.PLAYER_PREFIX!; 
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/greytop/callback`

export const POST = async (req: NextRequest) => {

  const auth = await verifyClient(req);
  if(!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const client = auth.client;
  try {
    const { 
      member_account,
      game_uid,
      credit_amount,
      currency_code = 'INR',
      language = 'en',
      home_url,
      platform = 1,
      callback_url = '',
    } = await req.json();

    if (!member_account || !game_uid || !credit_amount) {
      return NextResponse.json(
        { error: 'member_account, game_uid, and credit_amount are required.' },
        { status: 400 }
      );
    }

    const fullMemberAccount = `${PLAYER_PREFIX}${member_account}`;
    const timestamp = Date.now().toString();

    let clientMember = await prisma.clientMember.findFirst({
      where: {
        userId: client.id,
        memberAccount: fullMemberAccount,
      }
    })

    if (!clientMember) {
      clientMember = await prisma.clientMember.create({
        data: {
          userId: client.id,
          memberAccount: fullMemberAccount,
        },
      });
    }

    await prisma.gameSession.create({
      data: {
        clientMemberId: clientMember.id,
        gameUid: game_uid,
        creditAmount: credit_amount,
        currencyCode: currency_code,
        language: language,
        homeUrl: home_url,
        platform: platform,
        callbackUrl: callback_url,
        timestamp: BigInt(timestamp),
      }
    })

    const payloadObject = {
      agency_uid: AGENCY_UID,
      member_account: fullMemberAccount,
      game_uid,
      timestamp,
      credit_amount,
      currency_code,
      language,
      home_url,
      platform,
      callback_url: CALLBACK_URL,
    }

    const payloadString = JSON.stringify(payloadObject);
    const encryptedPayload = encryptAES(payloadString);

    const upstreamResponse = await fetch(`${SERVER_URL}/game/v1`, {
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

    const responseData = await upstreamResponse.json();

    return NextResponse.json({
      status: upstreamResponse.status,
      data: responseData
    })
  } catch (error) {
    console.error('Error in /api/Launch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
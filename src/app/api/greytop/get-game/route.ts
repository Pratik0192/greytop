
import { verifyClient } from '@/lib/verifyClient';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const POST = async (req: NextRequest) => {
  const auth = await verifyClient(req);
  if(!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const client = auth.client;

  try {
    const providers = await prisma.gameProvider.findMany({
      where: {
        id: {
          in: client.providersAllowed,
        },
      },
      select: {
        id: true,
        name: true,
        games: {
          select: {
            name: true,
            gameUid: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const data = providers.map((provider) => ({
      providerName: provider.name,
      providerCode: provider.id,
      games: provider.games.map((game) => ({
        name: game.name,
        uid: game.gameUid,
      })),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('CLIENT_PROVIDER_GAMES_ERROR:', error);

    return NextResponse.json(
      { error: 'Failed to fetch provider games' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const clientMemberId = Number(searchParams.get("clientMemberId"));
    const search = searchParams.get("search");
    const date = searchParams.get("date");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    if (!clientMemberId || isNaN(clientMemberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid clientMemberId" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Date filter (entire day)
    let dateFilter: Prisma.GameSessionWhereInput = {};
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      dateFilter = {
        createdAt: { gte: start, lte: end },
      };
    }

    const where: Prisma.GameSessionWhereInput = {
      clientMemberId,
      ...dateFilter,
      ...(search && {
        OR: [
          { gameUid: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            gameHistory: {
              some: {
                serialNumber: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
        ],
      }),
    };

    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          gameHistory: true,
        },
      }),
      prisma.gameSession.count({ where }),
    ]);

    const serializedSessions = sessions.map((session) => ({
      ...session,
      timestamp: session.timestamp.toString(),
      gameHistory: session.gameHistory.map((h) => ({
        ...h,
        betAmount: h.betAmount.toString(),
        winAmount: h.winAmount.toString(),
        profit: h.profit.toString(),
        loss: h.loss.toString(),
      })),
    }));

    return NextResponse.json({
      success: true,
      gameSessions: serializedSessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching game sessions:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
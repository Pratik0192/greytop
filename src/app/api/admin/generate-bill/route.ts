import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const { userId, month, year } = await req.json();

    if (!userId || !month || !year) {
      return NextResponse.json({ error: "userId, month, and year are required" }, { status: 400 });
    }

    const histories = await prisma.gameHistory.findMany({
      where: {
        gameSession: {
          clientMember: {
            userId: userId
          }
        },
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      include: {
        gameSession: true
      }
    });

    if (histories.length === 0) {
      return NextResponse.json({ message: "No data found for this month" });
    }

    const providerMap: Record<string, { profit: number; loss: number }> = {};

    for(const h of histories) {
      const providerCode = h.gameSession?.providerCode || "UNKNOWN";
      if(!providerMap[providerCode]) {
        providerMap[providerCode] = { profit: 0, loss: 0 };
      }
      providerMap[providerCode].profit += Number(h.profit);
      providerMap[providerCode].loss += Number(h.loss);
    }

    const totalProfit = Object.values(providerMap).reduce((sum, p) => sum + p.profit, 0);
    const totalLoss = Object.values(providerMap).reduce((sum, p) => sum + p.loss, 0);

    const bill = await prisma.monthlyBill.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {
        totalProfit,
        totalLoss,
        providers: {
          deleteMany: {},
          create: Object.entries(providerMap).map(([providerCode, { profit, loss }]) => ({
            providerCode,
            profit,
            loss
          }))
        }
      },
      create:{
        userId,
        month,
        year,
        totalProfit,
        totalLoss,
        providers: {
          create: Object.entries(providerMap).map(([providerCode, { profit, loss }]) => ({
            providerCode,
            profit,
            loss,
          })),
        },
      },
      include: { providers: true }
    });

    return NextResponse.json({ bill })
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
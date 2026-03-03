import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

type RangeType = "today" | "week" | "month" | "year";

function getDateRange(range: RangeType) {
  const now = new Date();
  let start = new Date();

  switch (range) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "week":
      start = new Date();
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start = new Date();
      start.setMonth(start.getMonth() - 1);
      break;
    case "year":
      start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end: new Date() };
}

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") || "today") as RangeType;

    const { start, end } = getDateRange(range);

    const historyFilter: Prisma.GameHistoryWhereInput = {
      createdAt: { gte: start, lte: end },
    };

    // ------------------ CLIENT METRICS ------------------

    const totalClients = await prisma.user.count({
      where: { role: "CLIENT" },
    });

    const activeClients = await prisma.user.count({
      where: { role: "CLIENT", status: "active" },
    });

    // ------------------ FINANCIAL TOTALS ------------------

    const aggregates = await prisma.gameHistory.aggregate({
      _sum: {
        betAmount: true,
        winAmount: true,
        profit: true,
        loss: true,
      },
      where: historyFilter,
    });

    const totalBet = aggregates._sum.betAmount ?? new Prisma.Decimal(0);
    const totalWin = aggregates._sum.winAmount ?? new Prisma.Decimal(0);
    const totalProfit = aggregates._sum.profit ?? new Prisma.Decimal(0);
    const totalLoss = aggregates._sum.loss ?? new Prisma.Decimal(0);

    // ------------------ LINE CHART DATA ------------------

    const dailyData = await prisma.gameHistory.groupBy({
      by: ["createdAt"],
      _sum: {
        betAmount: true,
        winAmount: true,
        profit: true,
      },
      where: historyFilter,
      orderBy: { createdAt: "asc" },
    });

    const lineChart = dailyData.map((d) => ({
      date: d.createdAt,
      bet: d._sum.betAmount?.toString() ?? "0",
      win: d._sum.winAmount?.toString() ?? "0",
      profit: d._sum.profit?.toString() ?? "0",
    }));

    // ------------------ PROVIDER PIE ------------------

    const providerData = await prisma.providerProfit.groupBy({
      by: ["providerCode"],
      _sum: { bill: true },
    });

    const providerChart = providerData.map((p) => ({
      provider: p.providerCode,
      revenue: p._sum.bill?.toString() ?? "0",
    }));

    // ------------------ MONTHLY COMPARISON ------------------

    const monthlyData = await prisma.monthlyBill.groupBy({
      by: ["month", "year"],
      _sum: { totalProfit: true },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const monthlyChart = monthlyData.map((m) => ({
      label: `${m.month}/${m.year}`,
      profit: m._sum.totalProfit?.toString() ?? "0",
    }));

    // ------------------ LIMIT BREACH ------------------

    const limitBreached = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        limit: { not: null },
        totalBill: {
          gte: prisma.user.fields.limit,
        },
      },
      select: {
        id: true,
        name: true,
        totalBill: true,
        limit: true,
      },
    });

    // ------------------ TOP CLIENTS ------------------

    const topClients = await prisma.providerProfit.groupBy({
      by: ["userId"],
      _sum: { bill: true },
      orderBy: { _sum: { bill: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      cards: {
        totalClients,
        activeClients,
        totalBet: totalBet.toString(),
        totalWin: totalWin.toString(),
        totalProfit: totalProfit.toString(),
        totalLoss: totalLoss.toString(),
      },
      lineChart,
      providerChart,
      monthlyChart,
      limitBreached,
      topClients,
    });
  } catch (error) {
    console.error("[Admin Dashboard Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
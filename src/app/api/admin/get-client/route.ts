import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";


export const POST = async (req: NextRequest) => {
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        apiKey: true,
        status: true,
        whitelistedIps: true,
        providersAllowed: true,
        createdAt: true,
        providerProfits: true
      }
    })

    const updatedClients = await Promise.all(
      clients.map(async (client) => {
        let totalBill = new Prisma.Decimal(0);

        const updatedProviderProfits = await Promise.all(
          client.providerProfits.map(async (pp) => {
            const provider = await prisma.gameProvider.findUnique({
              where: { id: pp.providerCode },
              select: { ggrPercent: true }
            });

            const ggrPercent = provider?.ggrPercent ?? 0;
            const bill = pp.profit.mul(ggrPercent).div(100);

            totalBill = totalBill.add(bill);

            await prisma.providerProfit.update({
              where: { id: pp.id },
              data: { bill }
            });

            return { ...pp, bill };
          })
        );

        await prisma.user.update({
          where: { id: client.id },
          data: { totalBill }
        })

        return {
          ...client,
          providerProfits: updatedProviderProfits,
          totalBill
        };
      })
    );

    return NextResponse.json({ success: true, updatedClients })
  } catch (error) {
    console.error("[Get Clients Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const { clientId, name, whitelistedIps, status, limit } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId }
    })

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedClient = await prisma.user.update({
      where: { id: clientId },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(whitelistedIps !== undefined && { whitelistedIps }),

        // ✅ limit handling
        ...(limit === null
          ? { limit: null }                 // unlimited
          : limit !== undefined
            ? { limit: new Prisma.Decimal(limit) }
            : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Client updated successfully",
      updatedClient
    })
  } catch (error) {
    console.error("[Update Client Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const GET = async(req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const date = searchParams.get("date");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Date filter (entire day)
    let dateFilter = {};
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      dateFilter = {
        createdAt: {
          gte: start,
          lte: end,
        },
      };
    }

    const where = {
      userId,
      ...(search && {
        memberAccount: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...dateFilter,
    };

    const [members, total] = await Promise.all([
      prisma.clientMember.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.clientMember.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching client members:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as any).message },
      { status: 500 }
    );
  }
}
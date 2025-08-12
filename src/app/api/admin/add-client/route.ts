import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma";

function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

export const POST = async (req: NextRequest) => {
  try {
    const { name, email, whitelistedIps, password, providersAllowed } = await req.json();

    if (!name || !email || !Array.isArray(whitelistedIps)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(providersAllowed) || !providersAllowed.every(p => typeof p === "string")) {
      return NextResponse.json({ error: "providersAllowed must be an array of strings" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        apiKey,
        whitelistedIps,
        providersAllowed,
        role: 'CLIENT',
        status: 'active',
        providerProfits: {
          create: providersAllowed.map(providerCode => ({
            providerCode,
            profit: new Prisma.Decimal(0.00),
          }))
        }
      },
      include: {
        providerProfits: true
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        role: user.role,
        whitelistedIps: user.whitelistedIps,
        providersAllowed: user.providersAllowed,
        providerProfits: user.providerProfits
      },
    });
  } catch (error) {
    console.error('[Add Client Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
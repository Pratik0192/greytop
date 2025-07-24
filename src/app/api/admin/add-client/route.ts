import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

export const POST = async (req: NextRequest) => {
  try {
    const { name, email, whitelistedIps, password } = await req.json();

    if (!name || !email || !Array.isArray(whitelistedIps)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
        role: 'CLIENT',
        status: 'active'
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
      },
    });
  } catch (error) {
    console.error('[Add Client Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
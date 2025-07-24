import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const POST = async(req: NextRequest) => {
  try {
    const { clientId, newPassword } = await req.json();

    if(!clientId || newPassword) {
      return NextResponse.json({ error: "Client ID and new password are required" }, { status: 400 });
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } });

    if(!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: clientId },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: "Client password reset successfully"
    })
  } catch (error) {
    console.error("[Reset Password Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
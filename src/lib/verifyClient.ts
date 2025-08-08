import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { User } from "@/generated/prisma";

type VerifyClientSuccess = { success: true; client: User };
type VerifyClientFailure = { success: false; status: number; message: string };

export async function verifyClient(req: NextRequest): Promise<VerifyClientSuccess | VerifyClientFailure> {
  const apiKey = req.headers.get("x-api-key");

  if(!apiKey) {
    return { success: false, status: 401, message: "Missing API key" };
  }

  const client = await prisma.user.findFirst({
    where: {
      apiKey,
      role: "CLIENT",
    }
  });

  if(!client) {
    return { success: false, status: 403, message: "Invalid API key" };
  }

  return { success: true, client };
}
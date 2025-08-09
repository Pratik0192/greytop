import { NextRequest, NextResponse } from "next/server";
import { decryptAES } from "@/lib/aes";

export const POST = async (req: NextRequest) => {
  console.log("callback called");
  
  try {
    const body = await req.json();

    const {
      timestamp,
      payload
    } = body;

    if(!payload) {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      );
    }

    const decryptedText = decryptAES(payload);

    let decryptedJson;
    try {
      decryptedJson = JSON.parse(decryptedText);
    } catch (error) {
      console.error("[CALLBACK] Failed to parse decrypted payload:", decryptedText);
      return NextResponse.json(
        { error: "Invalid decrypted payload format" },
        { status: 400 }
      );
    }

    console.log("[CALLBACK] Timestamp:", timestamp);
    console.log("[CALLBACK] Decrypted payload:", decryptedJson);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CALLBACK] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
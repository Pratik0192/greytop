import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET!;

function getJwtSecretKey() {
  if(!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(JWT_SECRET);
}

export async function middleware(req: NextRequest) {
  console.log("middleware running")

  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  if(!token) {
    if(pathname.startsWith("/admin") || pathname.startsWith("/client")) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const role = payload.role as string;

    if(pathname.startsWith("/admin") && role !== "ADMIN") {
      url.pathname = "/client";
      return NextResponse.redirect(url);
    }

    if(pathname.startsWith("/client") && role !== "CLIENT") {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/client", "/client/:path*"],
}
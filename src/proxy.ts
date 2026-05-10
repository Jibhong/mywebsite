// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenServer } from "@/lib/tokenAuth.server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const ok = await verifyTokenServer(session);
  
  if (!ok) {
    console.log("Unauthorized access attempt to dashboard");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
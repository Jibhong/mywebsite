import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { SignJWT } from "jose";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { initFirebase } from "@/lib/server/server.firebaseInterface";

export async function POST(req: Request) {
  let idToken: unknown;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof idToken !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = process.env.EMAIL;
  const jwtSecret = process.env.JWT_SECRET;
  if (!email || !jwtSecret) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  initFirebase();

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (decodedToken.email !== email || decodedToken.email_verified !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(new TextEncoder().encode(jwtSecret));

  const cookie = serialize("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json(
    { message: "Sign in successfully" },
    { status: 200, headers: { "Set-Cookie": cookie } },
  );
}

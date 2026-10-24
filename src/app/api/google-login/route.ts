import { NextResponse } from "next/server";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { initFirebase } from "@/lib/server/server.firebaseInterface";

export async function POST(req: Request) {
  let idToken: unknown;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
  }

  const email = process.env.EMAIL;
  const jwtSecret = process.env.JWT_SECRET;
  if (!email || !jwtSecret) {
    return NextResponse.json({ error: "Server authentication is not configured." }, { status: 500 });
  }

  initFirebase();

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid Google credential." }, { status: 401 });
  }

  if (decodedToken.email !== email || decodedToken.email_verified !== true) {
    return NextResponse.json({ error: "This Google account is not authorized." }, { status: 403 });
  }

  const token = jwt.sign({ email }, jwtSecret, { expiresIn: "1d" });
  const cookie = serialize("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json(
    { message: "Google sign-in successful." },
    { status: 200, headers: { "Set-Cookie": cookie } },
  );
}

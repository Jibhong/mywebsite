import { NextResponse } from "next/server";
import { serialize } from "cookie";
import jwt from 'jsonwebtoken';
import { dbCheckOtp } from "@/lib/server/server.firestoreInterface";

export async function POST(req: Request) {

  const { challengeId, otp } = await req.json();
  if (await dbCheckOtp(challengeId, otp)) {
    const email = process.env.EMAIL;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || !email) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });
    const cookie = serialize("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return NextResponse.json(
      { message: "Success OTP" },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  }

  return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
}

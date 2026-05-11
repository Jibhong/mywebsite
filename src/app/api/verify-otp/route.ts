import { NextResponse } from "next/server";
import { getCurrentOtp } from "@/app/api/login/route";
import { serialize } from "cookie";
import jwt from 'jsonwebtoken';
import { dbRemoveString } from "@/lib/firestoreInterface.server";


export async function POST(req: Request) {
  const { otp } = await req.json();
  if(await getCurrentOtp()=== null || !otp || otp===undefined || otp===null || typeof otp !== "string" || otp.trim() === "") {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }
  console.log(`${otp} == ${ await getCurrentOtp()}`)
  if (otp === await getCurrentOtp()) {
    dbRemoveString("OTP");
    const email = process.env.EMAIL;
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret || !email) return;
    const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });
    const cookie = serialize("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
    });
    return NextResponse.json(
            { message: "Success OTP" },
            { status: 200, headers: { "Set-Cookie": cookie } }
        );
  }

  return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
}

import { NextResponse } from "next/server";
import { getCurrentOtp } from "@/app/api/login/route";
import { getCurrentToken, generateNewToken } from "@/app/api/verify-token/route"
import { dbRemoveString } from "@/app/lib/dbHandler";

export async function POST(req: Request) {
  const { otp } = await req.json();
    console.log(`${otp} == ${ await getCurrentOtp()}`)
  if (otp === await getCurrentOtp()) {
    dbRemoveString("OTP");
    await generateNewToken();
    return NextResponse.json({ message: "Success OTP", token: await getCurrentToken() });
  }

  return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
}

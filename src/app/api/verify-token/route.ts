import crypto from "crypto";
import { NextResponse } from "next/server";
import { dbGetString, dbSetString } from "@/app/lib/dbHandler";

export async function POST(req: Request) {
  const { token } = await req.json();
  const currentToken = await getCurrentToken();
  if (currentToken == null || token !== currentToken)   return NextResponse.json({ error: "Invalid TOKEN" }, { status: 401 });
  if(token === currentToken) return NextResponse.json({ message: "Success TOKEN", token: currentToken });

}

export async function generateNewToken(length = 64) {
  const newToken = crypto.randomBytes(length).toString("hex");
  await dbSetString("TOKEN", newToken);
  return newToken;
}

export async function getCurrentToken() {
  try {
    return await dbGetString("TOKEN");
  } catch {
    return null;
  }
}
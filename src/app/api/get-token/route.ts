import { cookies } from 'next/headers';
import { verifyTokenServer } from '@/lib/tokenAuth.server';
import { NextRequest, NextResponse } from 'next/server';
import admin from "firebase-admin";
import { init } from 'next/dist/compiled/webpack/webpack';
import { initFirebase } from "@/lib/firebaseInterface";

interface TokenAndExpiry {
  token: string;
  expiresAt: number;
}

export async function GET() {
  await initFirebase();
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);
  const userEmail = ok;
  console.log("GET api/get-token, token valid:", ok);
  if (!ok || typeof userEmail !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const tokenRes = await getFirebaseToken(userEmail);
  if(!tokenRes) {
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
  return NextResponse.json({ token: tokenRes.token, expiresAt: tokenRes.expiresAt }, { status: 200 });
}

async function getFirebaseToken(uuid: string | null = null): Promise<TokenAndExpiry | null> {
  if(!uuid) return null;
  const newExpiresTime = Date.now() + 15 * 60 * 1000;
  const token = await admin.auth().createCustomToken(uuid, {
    role: "view-protected-blog",
    expiresAt: newExpiresTime,
  });
  return { token, expiresAt: newExpiresTime };
}

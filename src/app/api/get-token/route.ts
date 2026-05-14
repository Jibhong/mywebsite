import { cookies } from 'next/headers';
import { verifyTokenServer } from '@/lib/server/server.tokenAuth';
import { NextResponse } from 'next/server';
import { getAuth } from "firebase-admin/auth";
import { initFirebase } from "@/lib/server/server.firebaseInterface";

interface TokenAndExpiry {
  token: string;
  expiresAt: number;
}

export async function GET(req: Request) {
  
  initFirebase();
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);
  const userEmail = ok;
  console.log("GET api/get-token, token valid:", ok);
  if (!ok || typeof userEmail !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const tokenRes = await getFirebaseToken(userEmail);
  if (!tokenRes) {
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
  return NextResponse.json({ token: tokenRes.token, expiresAt: tokenRes.expiresAt }, { status: 200 });
}

async function getFirebaseToken(uuid: string | null = null): Promise<TokenAndExpiry | null> {
  if (!uuid) return null;
  const auth = getAuth();
  const newExpiresTime = Date.now() + 15 * 60 * 1000;
  const token = await auth.createCustomToken(uuid, {
    permissions: [
      "firebase-storage-view-protected-blog",
      "firestore-view-blog-index"
    ],
    expiresAt: newExpiresTime,
  });
  // await auth.setCustomUserClaims(uuid, {
  //   permissions: [
  //     "firebase-storage-view-protected-blog",
  //     "firestore-view-blog-index"
  //   ]
  // });
  return { token, expiresAt: newExpiresTime };
}


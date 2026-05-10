// @/lib/tokenAuth.server.ts

// import jwt from "jsonwebtoken";

import { jwtVerify } from "jose";

type TokenPayload = {
  email?: string;
  iat?: number;
  exp?: number;
};

export async function verifyTokenServer(token?: string | null) : Promise<boolean | string> {
  
  if (!token) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    if (payload.email !== process.env.EMAIL || typeof payload.email !== "string") {
      return false;
    }

    return payload.email;
  } catch {
    return false;
  }
}
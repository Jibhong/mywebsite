// import jwt from "jsonwebtoken";

import { jwtVerify } from "jose";

export async function verifyTokenServer(token?: string | null) {
  if (!token) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    if (payload.email !== process.env.EMAIL) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
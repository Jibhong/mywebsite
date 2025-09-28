import jwt from "jsonwebtoken";

type TokenPayload = {
  email?: string;
  iat?: number;
  exp?: number;
};

export async function verifyTokenServer(token?: string | null){
    if (!token) return false;
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret) return false;

    try {
        const payload = jwt.verify(token, jwtSecret) as TokenPayload;
        if (payload.email !== process.env.EMAIL) return false;
        return true;
    } catch (err) {
        // verification failed (invalid signature, expired, etc.)
        return false;
    }
}
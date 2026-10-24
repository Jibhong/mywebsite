import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).set("session", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return new Response("Logout successful", { status: 200 });
}
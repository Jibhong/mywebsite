import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { getAllBlogPath } from "@/lib/firebaseInterface";
import { getProtectedFilesUrls } from "@/lib/firebaseInterface";
import path from "path";

export async function GET() {
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const allPath = (await getAllBlogPath()) ?? [];
  const output: Record<string, { name: string; url: string }[]> = {};

  for (const folder of allPath) {
    const urls = (await getProtectedFilesUrls(folder)) ?? [];
    output[path.basename(folder)] = urls;
  }

  return NextResponse.json(output ?? {}, { status: 200 });
}

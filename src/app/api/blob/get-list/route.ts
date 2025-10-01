import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { getAllBlogPath, getProtectedFilesUrls } from "@/lib/firebaseInterface";

export async function GET(req: Request) {
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const allPath = (await getAllBlogPath()) ?? [];
  const output: Record<string, { name: string; url: string }[]> = {};

  for (const folder of allPath) {
    const urls = (await getProtectedFilesUrls(folder)) ?? [];
    output[getBaseName(folder)] = urls;
  }

  return NextResponse.json(output ?? {}, { status: 200 });
}

function getBaseName(folder: string): string {
  const parts = folder.split("/").filter(Boolean);
  return parts[parts.length - 1] || folder;
}

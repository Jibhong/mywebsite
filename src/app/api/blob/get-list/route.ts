import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { getAllBlogPath } from "@/lib/firebaseInterface";
import { getProtectedFilesUrls } from "@/lib/firebaseInterface";
import path from "path";

export async function GET() {
  console.log(`Start: ${new Date().toLocaleString()}`);
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const allPath = (await getAllBlogPath()) ?? [];
  
  const promises = allPath.map(async (folder) => {
    const urls = (await getProtectedFilesUrls(folder)) ?? [];
    return [path.basename(folder), urls] as const;
  });
  
  const results = await Promise.all(promises);
  
  const output: Record<string, { name: string; url: string }[]> = {};
  for (const [name, urls] of results) {
    output[name] = urls;
  }
  console.log(`End: ${new Date().toLocaleString()}`);
  return NextResponse.json(output ?? {}, { status: 200 });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { listFolderPaths } from "@/lib/firebaseInterface";
import { getProtectedFilesUrls } from "@/lib/firebaseInterface";
import path from "path";


export async function GET(req: Request) {
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const allPath = ["blog_page", "blog_page_protected"];
  const output: Record<string, Promise<{ name: string; url: string }[]>> = {};

  for (const e of allPath) {
    const res = await listFolderPaths(e);
    const pathsArray = res?.paths ?? [];

    const foldersSet = new Set<string>();

    pathsArray.forEach(p => {
      if (!p.startsWith(`${e}/`)) return;

      const cleaned = p.endsWith('/') ? p.slice(0, -1) : p;
      const parts = cleaned.split('/');

      if (parts.length >= 2 && !parts[1].includes('.')) {
        foldersSet.add(`${parts[0]}/${parts[1]}/`);
      }
    });

    for (const folder of foldersSet) {
      output[path.basename(folder)] = getProtectedFilesUrls(folder) ?? Promise.resolve([]);
    }
  }

  if (Object.keys(output).length === 0) {
    return NextResponse.json({});
  }

  const resolvedOutput = Object.fromEntries(
    await Promise.all(
      Object.entries(output).map(async ([key, promise]) => [key, await promise ?? []])
    )
  ) as Record<string, { name: string; url: string }[]>;

  return NextResponse.json(resolvedOutput);
}

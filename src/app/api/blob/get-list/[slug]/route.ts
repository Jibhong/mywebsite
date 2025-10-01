import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { getAllBlogPath } from "@/lib/firebaseInterface";
import { getProtectedFilesUrls } from "@/lib/firebaseInterface";
import path from "path";
import { url } from "inspector";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> } // <-- note Promise<>
) {
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const allPath = (await getAllBlogPath()) ?? [];

  const slug = await context.params;
  const match = allPath.find(
    (folder) =>
      folder === `blog_page/${slug}/` || folder === `blog_page_protected/${slug}/`
  );
  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }


  const urls = (await getProtectedFilesUrls(match)) ?? [];
  return NextResponse.json(urls ?? {}, { status: 200 });
}

import { dbUpdateBlogIndex } from "@/lib/server/server.firestoreInterface";
import { verifyTokenServer } from "@/lib/server/server.tokenAuth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const cookieHeader = (await cookies()).get("session")?.value;
    const ok = await verifyTokenServer(cookieHeader);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const { blogId, isPublished, isVisible } = await req.json();

    const res = await dbUpdateBlogIndex(blogId, isPublished, isVisible);
    if (!res) return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    return NextResponse.json({ ok: "ok" }, { status: 200 });
}
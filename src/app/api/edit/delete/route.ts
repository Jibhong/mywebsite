// app/api/edit/upload/route.ts
"use server"

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/server/server.tokenAuth";
import { getFirebaseStorageBucket, getFirestoreDB } from "@/lib/server/server.firebaseInterface";
import { getFirestore } from "firebase-admin/firestore";
import { error } from "console";
import { revalidatePath } from "next/cache";
import { getBlogUrl } from "@/lib/client/client.blogURLPhraser";
import { version } from "os";
import { metadata as reqMetadata } from "@/app/layout";

export async function POST(req: NextRequest) {
    const cookieHeader = (await cookies()).get("session")?.value;
    const ok = await verifyTokenServer(cookieHeader);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const formData = await req.formData();

    const fileToDel = formData.get("file") as File | null;
    const blogId = formData.get("blogId") as string | null;

    if (!blogId) {
        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const bucket = getFirebaseStorageBucket();

    const db = getFirestoreDB();
    const dbBlogIndex = db.collection("blog-index");
    const docRef = dbBlogIndex.doc(blogId);
    const snap = await docRef.get();
    if (!snap.exists) throw error("Blog to upload image not existed");
    const snapData = snap.data()
    if (!snapData) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    console.log(`visibility: ${snapData.isPublished ? "public" : null}`)
    const newMetadata = { visibility: snapData.isPublished ? "public" : null };


    if (fileToDel) {

        const filePath = `blog_page/${blogId}/file/${fileToDel}`;
        const file = bucket.file(filePath);
        await file.delete();
    }
    //   await docRef.update({
    //     version: Date.now()
    //   })
    return NextResponse.json({ success: true });
}
// app/api/upload-preview-image/route.ts
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

export async function POST(req: NextRequest) {
  const cookieHeader = (await cookies()).get("session")?.value;
  const ok = await verifyTokenServer(cookieHeader);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const blogId = formData.get("blogId") as string | null;

    if (!file || !blogId) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // resize + crop + convert
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const webpBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: "cover",
        position: "centre",
      })
      .webp({
        quality: 80,
      })
      .toBuffer();

    const db = getFirestoreDB();
    const dbBlogIndex = db.collection("blog-index");
    const docRef = dbBlogIndex.doc(blogId);
    const snap = await docRef.get();

    if (!snap.exists) throw error("Blog to upload image not existed");
    const snapData = snap.data()
    if (!snapData) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    const bucket = getFirebaseStorageBucket();
    const firebaseFile = bucket.file(
      `blog_page/${blogId}/preview.webp`
    );
    console.log(`visibility: ${snapData.isPublished ? "public" : null}`)
    await firebaseFile.save(webpBuffer, {
      metadata: {
        // contentType: "image/webp",
        // cacheControl: "public, max-age=60", // 1 min
        metadata: {
          visibility: snapData.isPublished ? "public" : null,
        }
      },
    });
    await docRef.update({
      version: Date.now()
    })
    // revalidatePath("/");
    // console.log(getBlogUrl(`/blog_page/${blogId}/preview.webp`));

    // debug output folder
    if (process.env.NODE_ENV === "development") {
      const outputDir = path.join(process.cwd(), "debug-preview");

      await fs.mkdir(outputDir, {
        recursive: true,
      });
      const outputPath = path.join(
        outputDir,
        `${blogId}.webp`
      );
      await fs.writeFile(outputPath, webpBuffer);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
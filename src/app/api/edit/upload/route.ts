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
  
  const blogId = formData.get("blogId") as string | null;
  const reqPreviewImage = formData.get("previewImage") as File | null;
  const reqMarkdown = formData.get("markdown") as string | null;
  const reqMetadata = formData.get("metadata") as string | null;
  const reqUploadFile = formData.get("uploadFile") as File | null;
  const reqUploadFileName = formData.get("uploadFileName") as string | null;
  const reqBlogAlias = formData.get("blogAlias") as string | null;

  if (!blogId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const bucket = getFirebaseStorageBucket();

  const db = getFirestoreDB();
  const dbBlogIndex = db.collection("blog-index");
  const docRef = dbBlogIndex.doc(blogId);
  const snap = await docRef.get();
  if (!snap.exists) throw error("Blog to upload not existed");
  const snapData = snap.data()
  if (!snapData) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

  console.log(`visibility: ${snapData.isPublished ? "public" : null}`)
  const newMetadata = { visibility: snapData.isPublished ? "public" : null };


  if (reqPreviewImage) {
    // resize + crop + convert
    const bytes = await reqPreviewImage.arrayBuffer();
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

    const firebaseFile = bucket.file(
      `blog_page/${blogId}/preview.webp`
    );
    await firebaseFile.save(webpBuffer, { metadata: { metadata: newMetadata } });

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
  }
  if (reqMarkdown) {
    const bucket = getFirebaseStorageBucket();
    const firebaseFile = bucket.file(
      `blog_page/${blogId}/content.md`
    );

    await firebaseFile.save(reqMarkdown, {
      metadata: {
        contentType: "text/markdown",
        metadata: newMetadata
      }
    });
  }
  if (reqMetadata) {
    const bucket = getFirebaseStorageBucket();
    const firebaseFile = bucket.file(
      `blog_page/${blogId}/metadata.json`
    );

    await firebaseFile.save(reqMetadata, {
      metadata: {
        contentType: "application/json",
        metadata: newMetadata
      }
    });
  }
  if (reqUploadFile && reqUploadFileName) {
    const arrayBuffer = await reqUploadFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const firebaseFile = bucket.file(
      `blog_page/${blogId}/file/${reqUploadFileName}`
    );

    await firebaseFile.save(buffer, {
      metadata: {
        metadata: newMetadata,
      },
    });
  }
  if (reqBlogAlias) {
    const alias = reqBlogAlias.trim();
    if (!alias || alias.includes("/") || alias === "." || alias === "..") {
      return NextResponse.json({ error: "Invalid alias" }, { status: 400 });
    }

    const aliasRef = db.collection("blog-alias").doc(alias);
    const indexRef = db.collection("blog-index").doc(alias);

    try {
      await db.runTransaction(async (tx) => {
        const [a, i] = await Promise.all([tx.get(aliasRef), tx.get(indexRef)]);
        if (a.exists || i.exists) throw new Error("EXISTS");
        tx.create(aliasRef, { target: blogId });
      });
    } catch (e) {
      if (e instanceof Error && e.message === "EXISTS") {
        return NextResponse.json({ error: "Alias already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  await docRef.update({
    version: Date.now()
  })
  return NextResponse.json({ success: true });
}
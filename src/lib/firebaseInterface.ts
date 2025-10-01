// lib/firebaseInterface.ts
import * as admin from "firebase-admin";
import path from "path";
import { Bucket } from "@google-cloud/storage";


let bucket: Bucket;

async function initFirebase() {
  if (!admin.apps.length) {
    console.log("Login to firebase service account");
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    const requiredVars = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "FIREBASE_STORAGE_BUCKET",
    ];

    const missingVars = requiredVars.filter((name) => !process.env[name]);

    if (missingVars.length > 0) {
      console.error("Missing Firebase environment variables:", missingVars.join(", "));
      throw new Error(`Missing Firebase environment variables: ${missingVars.join(", ")}`);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });
  }

  return admin.storage().bucket();
}

export async function getBucket() {
  if (!bucket) bucket = await initFirebase()
  return bucket;
}

/**
 * List all file paths directly inside a folder (not recursive).
 */
export async function listFolderPaths(folderPath: string = ""): Promise<{ paths: string[] }> {
  await getBucket();
  const cleanPath = folderPath.replace(/^\/+/, "");
  const [files] = await bucket.getFiles({
    prefix: cleanPath.endsWith("/") ? cleanPath : cleanPath + "/",
    // delimiter: "/", // prevents recursion if needed
  });

  const paths = files.map(file => file.name);

  return { paths };
}


const urlCache: Record<string, { name: string; url: string; expires: number }> = {};

export async function getProtectedFilesUrls(folderPath: string) {
  await getBucket();
  const [files] = await bucket.getFiles({ prefix: folderPath });

  const now = Date.now();
  const result = await Promise.all(
    files.map(async (file) => {
      const name = path.basename(file.name);
      const cached = urlCache[file.name];
      if (cached && cached.expires > now) return { name, url: cached.url };
      console.log("Fetching signed url");
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: now + 60 * 60 * 1000,
      });

      urlCache[file.name] = { name, url, expires: now + 60 * 60 * 1000 };
      return { name, url };
    })
  );

  return result;
}



export async function getAllBlogPath(): Promise<string[]>{
  const allPath = ["blog_page", "blog_page_protected"];
	// let output: Record<string, Promise<{ name: string; url: string }[]>> = {}; // store as Promise

  const folderResults = await Promise.all(
    allPath.map((e) => listFolderPaths(e))
  );

  const foldersArray: string[] = folderResults.flatMap((res, index) => {
    const basePath = allPath[index];
    return res.paths
      .filter((p) => p.startsWith(`${basePath}/`))
      .map((p) => {
        const cleaned = p.endsWith('/') ? p.slice(0, -1) : p;
        const parts = cleaned.split('/');
        return parts.length >= 2 && !parts[1].includes('.') ? `${parts[0]}/${parts[1]}/` : null;
      })
      .filter((p): p is string => p !== null); // Type guard to remove nulls
  });
  
  return foldersArray;
}
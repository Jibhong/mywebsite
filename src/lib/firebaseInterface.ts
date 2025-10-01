// lib/firebaseInterface.ts
import * as admin from "firebase-admin";
import path from "path";


// Only initialize once
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  // Ensure env vars exist
  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      "Missing Firebase environment variables. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET are set."
    );
  }

  // Replace literal '\n' with actual newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
}

export const bucket = admin.storage().bucket();

/**
 * List all file paths directly inside a folder (not recursive).
 */
export async function listFolderPaths(folderPath: string = ""): Promise<{ paths: string[] }> {
  const cleanPath = folderPath.replace(/^\/+/, "");

  const [files] = await bucket.getFiles({
    prefix: cleanPath.endsWith("/") ? cleanPath : cleanPath + "/",
    // delimiter: "/", // prevents recursion if needed
  });

  const paths = files.map(file => file.name);

  return { paths };
}


export async function getProtectedFilesUrls(folderPath: string): Promise<{ name: string; url: string }[]> {
  // List all files in the folder
  const [files] = await bucket.getFiles({ prefix: folderPath });

  // Generate signed URLs for each file
  const result = await Promise.all(
    files.map(async (file) => {
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return { name: path.basename(file.name), url };
    })
  );

  return result;
}


export async function getAllBlogPath(): Promise<string[]>{
  const allPath = ["blog_page", "blog_page_protected"];
	// let output: Record<string, Promise<{ name: string; url: string }[]>> = {}; // store as Promise

  const foldersSet = new Set<string>();
	for (const e of allPath) {
		const res = await listFolderPaths(e); // { paths: [...] }
		const pathsArray = res.paths;


		// Filter first-level folders only, ignoring files
		pathsArray.forEach(p => {
			if (!p.startsWith(`${e}/`)) return;

			const cleaned = p.endsWith('/') ? p.slice(0, -1) : p;
			const parts = cleaned.split('/');

			if (parts.length >= 2 && !parts[1].includes('.')) {
				foldersSet.add(`${parts[0]}/${parts[1]}/`);
			}
		});

	}
  return Array.from(foldersSet);
}
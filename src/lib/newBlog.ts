import { getBucket } from "@/lib/firebaseInterface"; // your firebase.ts


/**
 * Generate a random folder that does not exist in /blog_page or /blog_page_protected
 */
async function generateUniqueFolder(): Promise<string> {
  const bucket = await getBucket();
  let folderName: string = "";
  let exists = true;

  while (exists) {
    // Random 8-character folder name
    folderName = Array.from({ length: 16 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
    console.log(folderName)

    // Check both locations
    const blogFiles = await bucket.getFiles({ prefix: `blog_page/${folderName}/`, maxResults: 1 });
    const protectedFiles = await bucket.getFiles({ prefix: `blog_page_protected/${folderName}/`, maxResults: 1 });

    exists = blogFiles[0].length > 0 || protectedFiles[0].length > 0;
  }

  return folderName;
}

/**
 * Create JSON file inside a new unique folder in /blog_page_protected
 */
export async function getBlogUrl(): Promise<string> {
  const bucket = await getBucket();
  const folderName = await generateUniqueFolder();
  const folderPath = `blog_page_protected/${folderName}/`;

  const data = {
    title: "Hello",
    description: "Hello this is title for cards. Hello wow >:3c",
    date: Math.floor(Date.now() / 1000),
  };

  const filePath = `${folderPath}metadata.json`;
  const file = bucket.file(filePath);

  await file.save(JSON.stringify(data, null, 2), {
    contentType: "application/json",
  });

  return folderName; // return full path
}
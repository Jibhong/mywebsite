import { getFirebaseStorageBucket } from "@/lib/server/server.firebaseInterface"; // your firebase.ts
import { dbAddBlogIndex, dbBlogIndexExisted } from "./server.firestoreInterface";


/**
 * Generate a random folder that does not exist in /blog_page or /blog_page_protected
 */
async function generateUniqueFolder(): Promise<string> {
  const bucket = await getFirebaseStorageBucket();
  let folderName: string = "";
  let exists = true;

  while (exists) {
    // Random 8-character folder name
    folderName = crypto.randomUUID();
    console.log(folderName)

    exists = await dbBlogIndexExisted(folderName);
  }

  dbAddBlogIndex(folderName, false, false);
  return folderName;
}

/**
 * Create JSON file inside a new unique folder in /blog_page_protected
 */
export async function getNewBlogUrl(): Promise<string> {
  const bucket = await getFirebaseStorageBucket();
  const folderName = await generateUniqueFolder();
  const folderPath = `blog_page/${folderName}/`;

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
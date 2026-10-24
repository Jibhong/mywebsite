import { getFirebaseStorageBucket, getFirestoreDB, initFirebase } from "@/lib/server/server.firebaseInterface";

initFirebase();

const db = getFirestoreDB();

const dbBlogIndex = db.collection("blog-index");
const dbPublicBlogIndex = db.collection("public-blog-index");

export async function dbAddBlogIndex(path: string, isPublished?: boolean | undefined, isVisible?: boolean | undefined) {
  if (isVisible === true && isPublished === false) throw new Error("dbAddBlogIndex() -> visible blog must be published");
  const docRef = dbBlogIndex.doc(path);
  const snap = await docRef.get();
  if (snap.exists) {
    return false;
  }
  await docRef.set({
    isPublished,
    isVisible,
    version: Date.now()
  })
  return true;
}

async function setBlogFolderPublished(path: string, isPublished: boolean) {
  const bucket = getFirebaseStorageBucket();
  // ensures trailing slash
  const prefix = `blog_page/${path}/`;

  const [files] = await bucket.getFiles({
    prefix
  });
  if (isPublished === true) {
    await Promise.all(
      files.map(async (file) => {
        const currentMetadata =
          file.metadata.metadata || {};

        await file.setMetadata({
          metadata: {
            ...currentMetadata,
            visibility: "public"
          }
        });
      })
    );
  }
  else if (isPublished === false) {
    await Promise.all(
      files.map(async (file) => {
        await file.setMetadata({
          metadata: {
            visibility: null
          }
        });
      })
    );
  }
  return {
    updated: files.length
  };
}

async function setBlogFolderVisible(path: string, isVisible: boolean) {
  if (isVisible === true) {
    await dbPublicBlogIndex.doc(path).set({});
  } else if (isVisible === false) {
    await dbPublicBlogIndex.doc(path).delete();
  }
}

export async function dbUpdateBlogIndex(path: string, isPublished?: boolean | undefined, isVisible?: boolean | undefined) {
  if (isVisible === true && isPublished === false) throw new Error("dbUpdateBlogIndex() -> visible blog must be published");
  console.log("Path of blog-index want to update:", path);
  console.log("isPublished", isPublished);
  console.log("isVisible", isVisible);
  const docRef = dbBlogIndex.doc(path);
  const snap = await docRef.get();
  if (!snap.exists) {
    return false;
  }

  const updateData: Record<string, boolean> = {};

  if (isPublished === false)
    isVisible = false;
  if (isVisible === true)
    isPublished = true;

  if (typeof isPublished === "boolean") {
    await setBlogFolderPublished(path, isPublished);
    updateData.isPublished = isPublished;

  }

  if (typeof isVisible === "boolean") {
    await setBlogFolderVisible(path, isVisible);
    updateData.isVisible = isVisible;
  }

  await docRef.update(updateData);
  return true;
}

export async function dbBlogIndexExisted(path: string) {
  const docRef = dbBlogIndex.doc(path);
  const snap = await docRef.get();
  if (!snap.exists) {
    return false;
  }
  return true;
}

// export async function dbGetAllBlogIndex() {
//   const snap = await dbBlogIndex.get();
//   return snap.docs.map((doc) => ({
//     path: doc.id,
//     ...doc.data(),
//   }));
// }
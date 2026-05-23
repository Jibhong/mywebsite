import { getFirebaseStorageBucket, getFirestoreDB, initFirebase } from "@/lib/server/server.firebaseInterface";
import { error } from "console";
import { FieldValue } from "firebase-admin/firestore";

initFirebase();

const db = getFirestoreDB();
const dbOtp = db.collection("otp");

export async function dbSetOtp(userId: string, challengeId: string, otp: string, expiresAt: number) {
  const isExisting = await dbOtp.where("userId", "==", userId).get();
  const dbBatch = db.batch();
  isExisting.forEach((challengeIdOfuserId) => {
    dbBatch.delete(challengeIdOfuserId.ref);
  });
  dbBatch.set(dbOtp.doc(challengeId), { userId, otp, triesLeft: 5, expiresAt });
  await dbBatch.commit();
}

export async function dbCheckOtp(challengeId: string, otp: string) {

  const docRef = dbOtp.doc(challengeId);
  const snap = await docRef.get();

  // No challengeId
  if (!snap.exists) return false;

  const data = snap.data();
  if (!data) return false;
  const expiresAt = data.expiresAt;
  const triesLeft = data.triesLeft;
  const realOtp = data.otp;

  // Expired || no triesLeft
  if (expiresAt && Date.now() > expiresAt || !expiresAt || triesLeft <= 0 || !triesLeft) {
    await docRef.delete();
    return false;
  }

  // Decrease triesLeft
  await docRef.update({ triesLeft: FieldValue.increment(-1) });

  // Bad otp
  if (!otp || otp === undefined || otp === null || typeof otp !== "string" || otp.trim() === "") {
    return false;
  }

  // Wrong otp
  if (otp !== realOtp) {
    return false;
  }

  // Remove otp
  await docRef.delete();

  return true;

}

export async function dbRemoveOtp(challengeId: string) {
  await dbOtp.doc(challengeId).delete();
}

// const dbRateLimit = db.collection("rate-limit");

// export async function dbRateLimitAdd(userId: string) {
//   // await 
// }

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
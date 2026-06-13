import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { Bucket } from "@google-cloud/storage";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { env } from "@/lib/server/env";

let bucket: Bucket;
let firestore: Firestore;


export function initFirebase() {
  if (!getApps().length) {
    console.log("Login to firebase service account");

    const projectId = env.FIREBASE_PROJECT_ID;
    const clientEmail = env.FIREBASE_CLIENT_EMAIL;
    const privateKey = env.FIREBASE_PRIVATE_KEY;
    const storageBucket = env.FIREBASE_STORAGE_BUCKET;

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey?.replace(/\\n/g, "\n"),
      }),
      storageBucket,
    });
  }

  return;
}

export const getFirebaseStorageBucket = () => {
  if (!bucket) {
    initFirebase();
    bucket = getStorage().bucket();
  }
  return bucket;
}

export const getFirestoreDB = () => {
  if (!firestore) {
    initFirebase();
    firestore = getFirestore("portfolio-website-firestore");
  }
  return firestore;
}
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { Bucket } from "@google-cloud/storage";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { initializeUI } from '@firebase-oss/ui-core';
import { FirebaseUIProvider } from '@firebase-oss/ui-react';

export function initFirebase(): App | undefined {
  if (!getApps().length) {
    console.log("Login to firebase service account");

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    return initializeApp({
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

export const  getFirebaseApp: App = getApps().length ? getApps()[0] : initFirebase() as App;

export const getFirebaseStorageBucket = () => {
  return getStorage().bucket();
}

export const getFirestoreDB = () => {
  return getFirestore(getFirebaseApp, "portfolio-website-firestore");
}
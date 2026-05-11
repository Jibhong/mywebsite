import { getFirestoreDB, initFirebase } from "@/lib/firebaseInterface.server";

initFirebase();

const db = getFirestoreDB();
const col = db.collection("store");

export async function dbSetString(key: string, value: string, expiresAt: number) {
  await col.doc(key).set({ value, expiresAt });
}

export async function dbGetString(key: string) {
  const docRef = col.doc(key);
  const snap = await docRef.get();

  if (!snap.exists) return null;

  const data = snap.data();
  const expiresAt = data?.expiresAt;

  if (expiresAt && Date.now() > expiresAt || !expiresAt) {
    await docRef.delete();
    return null;
  }

  return data?.value ?? null;
}

export async function dbRemoveString(key: string) {
  await col.doc(key).delete();
}
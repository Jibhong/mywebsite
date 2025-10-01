"use client";

// export async function getBlobUrl(url:string) {
//     const res = await fetch(`api/blob/${url}`);
//     console.log(url)
//     if(!res.ok) return;
//     const res_json = await res.json();
//     return res_json.url;
// }
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET; 

export async function getBlobUrl(path: string): Promise<string> {
  if (path.startsWith("/")) path = path.slice(1);
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedPath}?alt=media`;
}

// export async function getRestrictedBlobUrl(path: string): Promise<string> {
//   if (path.startsWith("/")) path = path.slice(1);
//   const encodedPath = encodeURIComponent(path);
//   return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedPath}?alt=media`;
// }

export async function getRestrictedBlobUrl(url:string): Promise<string>  {
    const res = await fetch(`api/blob/${url}`);
    console.log(url)
    if(!res.ok) return "";
    const res_json = await res.json();
    return res_json.url;
}
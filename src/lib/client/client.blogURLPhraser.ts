export function getBlogUrl(path: string){
  const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET; 
  if (path.startsWith("/")) path = path.slice(1);
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedPath}?alt=media`;
}
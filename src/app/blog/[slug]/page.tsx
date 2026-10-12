import Home from "./home";
import { getFirestoreDB } from "@/lib/server/server.firebaseInterface";

async function getBlogId(slug: string): Promise<string | null> {
  const db = getFirestoreDB();

  const direct = await db.collection("blog-index").doc(slug).get();
  if (direct.exists && direct.data()!.isPublished) return direct.id;

  const alias = await db.collection("blog-alias").doc(slug).get();
  if (alias.exists && (await db.collection("blog-index").doc(alias.data()!.target).get()).data()!.isPublished) return alias.data()!.target as string;

  return null;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <Home promiseBlogId={getBlogId(slug)} />;
}
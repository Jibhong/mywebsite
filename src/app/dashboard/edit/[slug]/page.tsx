import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import path from "path";



import NewPage from "./realPage"
import { getAllBlogPath, listFolderPaths } from "@/lib/firebaseInterface";

export default async function Home({ params : promiseParam }: { params: { slug: string } }) {

  const params = await promiseParam;

  const cookieHeader = (await cookies()).get("session")?.value;

  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    redirect("/login");
  }
  const allPath = await getAllBlogPath();

  let goodPath = false;

  for (const e of allPath){
    if(path.basename(e) !== params.slug) continue;
    goodPath = true;
    break;
  }

  if (!goodPath) {
    redirect("/dashboard");
  }

  return (
    <NewPage slug={params.slug}/>
  );
}
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBlogUrl } from "@/lib/newBlog";




export default async function Home() {

  const location = await getBlogUrl();
  
  console.log("new blog path created:", location);

  redirect(`/dashboard/edit/${location}`);
}
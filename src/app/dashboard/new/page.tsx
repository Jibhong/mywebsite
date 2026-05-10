import { redirect } from "next/navigation";
import { getNewBlogUrl } from "@/lib/newBlog";




export default async function Home() {

  const cookieHeader = (await cookies()).get("session")?.value

  const ok = await verifyTokenServer(cookieHeader);

  const location = await getNewBlogUrl();
  
  console.log("new blog path created:", location);

  redirect(`/dashboard/edit/${location}`);
}
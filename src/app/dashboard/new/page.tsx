import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBlogUrl } from "@/lib/newBlog";




export default async function Home({ params : promiseParam }: { params: { slug: string } }) {

  const params = await promiseParam;

  const cookieHeader = (await cookies()).get("session")?.value

  const ok = await verifyTokenServer(cookieHeader);

  const location = await getBlogUrl();

  if (!ok) {
    redirect("/login");
  }
  else {
    redirect(`/dashboard/edit/${location}`);
  }
}
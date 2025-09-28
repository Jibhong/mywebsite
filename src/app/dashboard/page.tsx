import { Header, Footer, SearchBar, BigSpinner } from "@/app/lib/elements";
import { verifyTokenServer } from "@/app/lib/tokenAuth.server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";



import RealHome from "./realPage"

export default async function Home() {

  let isAuthed: boolean = false;
  const cookieStore = cookies(); // server-side cookie store
  const token = (await cookieStore).get("token")?.value

  const ok = await verifyTokenServer(token);

  if (!ok) {
    redirect("/login");
  }
  else return (
    <RealHome />
  );
}
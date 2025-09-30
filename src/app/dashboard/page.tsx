import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";



import DashboardPage from "./realPage"

export default async function Home() {

  const cookieHeader = (await cookies()).get("session")?.value

  const ok = await verifyTokenServer(cookieHeader);

  if (!ok) {
    redirect("/login");
  }
  else return (
    <DashboardPage />
  );
}
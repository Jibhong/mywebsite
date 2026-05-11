"use client";
import { logInToFirebase } from "@/lib/tokenFetcher.client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    logInToFirebase();
  }, [pathname]);

  return (
    <>
      {children}
    </>
  );
}
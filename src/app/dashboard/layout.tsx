"use client";
import logInToFirebase from "@/lib/tokenFetcher.client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {  
	logInToFirebase();
  return (
    <>
      {children}
    </>
  );
}
"use client";
import { logInToFirebase } from "@/lib/client/client.tokenFetcher";
import { createContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const isFirebaseLoginContext = createContext(false);


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loggedInToFirebase, setLoggedInToFirebase] = useState(false);

  useEffect(() => {
    async function performFirebaseLogin() {
      await logInToFirebase();
      setLoggedInToFirebase(true);
    }
    performFirebaseLogin();
  }, [pathname]);

  return (
    <isFirebaseLoginContext.Provider value={loggedInToFirebase}>
      {children}
    </isFirebaseLoginContext.Provider>
  );
}
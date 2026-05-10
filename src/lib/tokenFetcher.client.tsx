"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { singletonFirebaseAuth } from "@/lib/singleton/firebaseAuth.client";

export default async function logInToFirebase() {
  const pathname = usePathname();
  
  useEffect(() => {
    async function fetchToken() {
      const storedExpiry = localStorage.getItem("tokenExpiry");
      if (storedExpiry && parseInt(storedExpiry) > Date.now()) return;
      console.log("route changed:", pathname);
      const res = await fetch("/api/get-token");
      const data = await res.json();
      if (data.token){
        localStorage.setItem("token", data.token);
        localStorage.setItem("tokenExpiry", data.expiresAt);
      }
      // console.log("token received:", data.token);

    }
    async function signInWithToken() {
      const token = localStorage.getItem("token");
      if (!token) return;
      await signInWithCustomToken(singletonFirebaseAuth, token);
    }
    fetchToken();
    signInWithToken();
  }, [pathname]);

  return null;
}
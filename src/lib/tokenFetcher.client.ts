"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { singletonFirebaseAuth } from "@/lib/singleton/firebaseAuth.client";

export async function logInToFirebase() {
  console.log("Attempting to log in to Firebase...");
  async function fetchToken() {
    const storedExpiry = localStorage.getItem("tokenExpiry");
    if (storedExpiry && parseInt(storedExpiry) > Date.now()) return;
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
    console.log("signing in to firebase with token:", "**HIDDEN**");
    await signInWithCustomToken(singletonFirebaseAuth, token);
  }
  await fetchToken();
  await signInWithToken();

  return;
}
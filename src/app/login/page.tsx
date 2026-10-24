"use client";

import { GoogleAuthProvider, signInWithPopup, signOut, type UserCredential } from "firebase/auth";
import { singletonFirebaseAuth } from "@/lib/client/singleton/client.firebaseAuth";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Header } from "@/lib/client/components/elements";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (cause: unknown) => {
    const code = typeof cause === "object" && cause !== null && "code" in cause ? String(cause.code) : "";

    switch (code) {
      case "auth/unauthorized-domain":
        return "This site isn't authorized for Google sign-in. Add its domain in Firebase Authentication settings.";
      case "auth/operation-not-allowed":
        return "Google sign-in isn't enabled for this Firebase project.";
      case "auth/network-request-failed":
        return "A network error interrupted sign-in. Check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many sign-in attempts. Wait a moment, then try again.";
      case "auth/user-disabled":
        return "This Google account has been disabled. Contact the site administrator.";
      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
      case "auth/popup-closed-by-user":
        return "The Google sign-in window was closed before sign-in finished.";
      case "auth/cancelled-popup-request":
        return "A Google sign-in window is already open. Finish or close it before trying again.";
      default:
        return "Google sign-in couldn't be completed. Please try again.";
    }
  };

  async function clearFirebaseAuth() {
    try {
      await signOut(singletonFirebaseAuth);
    } catch (signOutError) {
      console.error("Failed to sign out.", signOutError);
    }
  };

  async function handleGoogleSignIn({ user }: UserCredential) {
    setIsLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const message =
          typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Google sign-in was not authorized.";
        setError(message);
        await clearFirebaseAuth();
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Couldn't verify your sign-in with the server. Check your connection and try again.");
      await clearFirebaseAuth();
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Header />
      <div className="w-full max-w-xs">
        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            setError("");
            setIsLoading(true);
            try {
              const credential = await signInWithPopup(
                singletonFirebaseAuth,
                (new GoogleAuthProvider()).setCustomParameters({ prompt: "select_account" }),
              );
              await handleGoogleSignIn(credential);
            } catch (cause: unknown) {
              setError(getErrorMessage(cause));
              setIsLoading(false);
            }
          }}
          className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span role="status">Signing in…</span>
          ) : (
            <>
              <FcGoogle aria-hidden="true" size={20} />
              Sign in with Google
            </>
          )}
        </button>
        {error && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-sm rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-semibold">Sign-in failed</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-3 font-medium underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link"
import Image from "next/image"
import { signOut } from "firebase/auth";
import { singletonFirebaseAuth } from "../singleton/client.firebaseAuth";
import { useRouter } from "next/navigation";



export function HeaderDashboard() {

  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function signOutButton() {
    await signOut(singletonFirebaseAuth);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Error occurred while logging out:", error);
      return;
    }
    router.push("/login");
  }

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 py-2 transition-all duration-500 ${scrolled ? "bg-white/50 shadow-xl backdrop-blur-md " : "bg-white/80 backdrop-blur-md "
        }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6">
        <h1 className={`font-bold text-gray-800 text-xl sm:text-2xl transition-all duration-300 ${scrolled ? "text-lg" : "text-2xl"}`}>
          <Link href="/dashboard">Dashboard</Link>
        </h1>
        <nav className="space-x-4 sm:space-x-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900 transition">Home</Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition">Search</Link>
          <Link href="/dashboard/new" className="text-gray-700 hover:text-gray-900 transition">New</Link>
          <button onClick={() => signOutButton()} className="text-red-600 hover:text-red-700  transition cursor-pointer">Sign out</button>
        </nav>
      </div>
    </header>
  );
}

//
// Toggle Button inside card
//
type CheckboxComponentProps = {
  functionToCallWhenChanged?: (cardPath: string, isChacked: boolean, isWhat: string) => void;
  cardPath: string;
  labelOffIcon: string; // image URL
  labelOnIcon: string;  // image URL
  isChacked: boolean;
  isWhat: string;
}

export function CardCheckboxComponent({
  functionToCallWhenChanged,
  cardPath,
  labelOffIcon,
  labelOnIcon,
  isChacked,
  isWhat,
}: CheckboxComponentProps) {
  return (
    <button
      type="button"
      className="w-6 h-6 flex items-center justify-center"
      onClick={() => {
        functionToCallWhenChanged?.(cardPath, !isChacked, isWhat);
      }}
    >
      <Image
        src={isChacked ? labelOnIcon : labelOffIcon}
        alt="toggle"
        className="w-full h-full object-contain"
        width={24}
        height={24}
      />
    </button>
  )
}
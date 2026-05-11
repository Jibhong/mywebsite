"use client";

import { useState, useEffect } from "react";
import Link from "next/link"
import Image from "next/image"



export function HeaderDashboard() {
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

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 py-2 transition-all duration-500 ${
        scrolled ? "bg-white/50 shadow-xl backdrop-blur-md " : "bg-white/80 backdrop-blur-md "
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
        </nav>
      </div>
    </header>
  );
}

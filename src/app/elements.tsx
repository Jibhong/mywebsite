"use client";

import { useState, useEffect } from "react";
import Image from "next/image";


export function Header() {
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
          Portfolio
        </h1>
        <nav className="space-x-4 sm:space-x-6">
          <a href="/" className="text-gray-700 hover:text-gray-900 transition">About</a>
          <a href="/" className="text-gray-700 hover:text-gray-900 transition">Projects</a>
          <a href="/" className="text-gray-700 hover:text-gray-900 transition">Contact</a>
        </nav>
      </div>
    </header>
  );
}


export function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white mt-16">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm">&copy; 2025-{new Date().getFullYear()} PISIT APIRATWARAKUL. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="https://github.com/Jibhong" className="hover:text-gray-300 transition">GitHub</a>
          <a href="https://linkedin.com/in/Jibhong" className="hover:text-gray-300 transition">LinkedIn</a>
          <a href="mailto:jibhongsup@gmail.com" className="hover:text-gray-300 transition">Email</a>
        </div>
      </div>
    </footer>
  );
}

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto p-10 pt-5">
      {/* <Image src="/search.svg" alt="Search" width={24} height={24} className=""/> */}
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find a project..."
        className="mx-1 flex-1 px-4 py-2 border bg-white border-gray-300 focus outline-none focus:ring-2 focus ring-blue-500 focus transition rounded-xl"
      />
      <button
        type="submit"
        className=" px-4 py-2 bg-blue-600 text-white font-semibold  hover:bg-blue-500 transition rounded-xl"
      >
        Search
      </button>
    </form>
  );
}
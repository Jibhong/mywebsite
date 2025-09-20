"use client";

import Image from "next/image";
import { Header, Footer, SearchBar } from "./elements";
import { RepoGrid } from "./card";
import { useEffect, useState } from "react";



export default function Home() {

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Add your search logic here
  };
  useEffect(() => {
    async function fetchCards() {
      const res = await fetch(
        "https://dcet4rnv2wp0nxq3.public.blob.vercel-storage.com/blog_pages/index.json"
      );
      const card_list = await res.json();
      console.log(card_list);
      for(let i=0; i<Math.min(6,card_list.length); i++){
        console.log(i);
    }
    }
    fetchCards();
  }, []);
  
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 pt-30 overflow-y-auto">

      <Header />

      <div className=" px-10 flex flex-col items-center mb-16">
        <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image 
            src="/profile.png" 
            alt="User Profile" 
            fill 
            className="object-cover"
          />
        </div>

        <div className="mt-8 text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          {"Hello, I'm"}
        </div>
        <div className="mt-2 text-4xl sm:text-4xl font-bold text-gray-800 text-center">
          PISIT
          APIRATWARAKUL
        </div>

        <p className="mt-4 text-center text-gray-700 max-w-xl text-lg sm:text-xl">
          {"I'm a self-taught developer and creative enthusiast. I love coding, 3D modeling, VFX, and exploring new technologies."}
        </p>
      
        <div className="mt-6 flex space-x-4">
          <a 
            href="https://github.com/Jibhong" 
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/Jibhong/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            LinkedIn
          </a>
        </div>
      </div>


      <div className=" text-2xl sm:text-3xl font-bold text-gray-600 text-center">
        PROJECTS
      </div>
      <SearchBar onSearch={handleSearch} />

      <div className="px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          

          <h2 className="text-xl font-bold mb-2 text-gray-700">My GitHub Repo</h2>
          <p className="text-gray-700 mb-2">
            Repo description goes here. You can add stars, forks, and latest commits info.
          </p>
          <a 
            href="https://github.com/Jibhong/mywebsite" 
            className="text-gray-500 hover:underline font-medium mb-2 block"
          >
            View Page
          </a>

          <Image 
            src="/profile.png" 
            alt="Repo image" 
            width={400} 
            height={192} 
            className="w-full h-48 object-cover rounded-2xl"
          />
          
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          

          <h2 className="text-xl font-bold mb-2 text-gray-700">My GitHub Repo</h2>
          <p className="text-gray-700 mb-2">
            Repo description goes here. You can add stars, forks, and latest commits info.
          </p>
          <a 
            href="https://github.com/Jibhong/mywebsite" 
            className="text-gray-500 hover:underline font-medium mb-2 block"
          >
            View Page
          </a>

          <Image 
            src="/profile.png" 
            alt="Repo image" 
            width={400} 
            height={192} 
            className="w-full h-48 object-cover rounded-2xl"
          />
          
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          

          <h2 className="text-xl font-bold mb-2 text-gray-700">My GitHub Repo</h2>
          <p className="text-gray-700 mb-2">
            Repo description goes here. You can add stars, forks, and latest commits info.
          </p>
          <a 
            href="https://github.com/Jibhong/mywebsite" 
            className="text-gray-500 hover:underline font-medium mb-2 block"
          >
            View Page
          </a>

          <Image 
            src="/profile.png" 
            alt="Repo image" 
            width={400} 
            height={192} 
            className="w-full h-48 object-cover rounded-2xl"
          />
          
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          

          <h2 className="text-xl font-bold mb-2 text-gray-700">My GitHub Repo</h2>
          <p className="text-gray-700 mb-2">
            Repo description goes here. You can add stars, forks, and latest commits info.
          </p>
          <a 
            href="https://github.com/Jibhong/mywebsite" 
            className="text-gray-500 hover:underline font-medium mb-2 block"
          >
            View Page
          </a>

          <Image 
            src="/profile.png" 
            alt="Repo image" 
            width={400} 
            height={192} 
            className="w-full h-48 object-cover rounded-2xl"
          />
          
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          

          <h2 className="text-xl font-bold mb-2 text-gray-700">My GitHub Repo</h2>
          <p className="text-gray-700 mb-2">
            Repo description goes here. You can add stars, forks, and latest commits info.
          </p>
          <a 
            href="https://github.com/Jibhong/mywebsite" 
            className="text-gray-500 hover:underline font-medium mb-2 block"
          >
            View Page
          </a>

          <Image 
            src="/profile.png" 
            alt="Repo image" 
            width={400} 
            height={192} 
            className="w-full h-48 object-cover rounded-2xl"
          />
          
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          

          <h2 className="text-xl font-bold mb-2 text-gray-700">My GitHub Repo</h2>
          <p className="text-gray-700 mb-2">
            Repo description goes here. You can add stars, forks, and latest commits info.
          </p>
          <a 
            href="https://github.com/Jibhong/mywebsite" 
            className="text-gray-500 hover:underline font-medium mb-2 block"
          >
            View Page
          </a>

          <Image 
            src="/profile.png" 
            alt="Repo image" 
            width={400} 
            height={192} 
            className="w-full h-48 object-cover rounded-2xl"
          />
          
        </div>
      </div>
      

      <Footer />


    </div>
  );
}

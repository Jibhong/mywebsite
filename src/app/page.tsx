"use client";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar } from "@/app/elements";
import { useEffect, useState } from "react";
import { Suspense } from "react";


const BLOB  = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

interface Card {
  title: string;
  description: string;
  path: string;
  thumbnail: string;
  link: string;
}

export default function Home() {
  

  const [cards, setCards] = useState<Card[]>([]);


  useEffect(() => {
    async function fetchCards() {
      const res = await fetch(
        BLOB+"/blog_pages/index.json"
      );
      const card_list = await res.json();
      console.log(card_list);
      const tempCards : Card[] = [];
      for(let i=0; i<Math.min(6,card_list.length); i++){
        console.log(i);
        const res = await fetch(BLOB+"/blog_pages/"+card_list[i]+"/metadata.json");
        const card = await res.json(); 
        console.log(card);      
        tempCards.push({ ...card, path: card_list[i], thumbnail: BLOB+"/blog_pages/"+card_list[i]+"/preview.webp", link: "blog/"+card_list[i]}); // append multiple times to temp array
        tempCards.push({ ...card, path: card_list[i], thumbnail: BLOB+"/blog_pages/"+card_list[i]+"/preview.webp", link: "blog/"+card_list[i]}); // append multiple times to temp array
        tempCards.push({ ...card, path: card_list[i], thumbnail: BLOB+"/blog_pages/"+card_list[i]+"/preview.webp", link: "blog/"+card_list[i]}); // append multiple times to temp array

      }
      setCards(tempCards);
    }
    fetchCards();
  }, []);
  
  return (
    <div className="font-sans min-h-screen bg-orange-50 pt-30 overflow-y-auto ">
      <div className="min-h-screen pb-10">

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
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar />
        </Suspense>

        <div id="card_container" className="px-10 2xl:px-[7%] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.length > 0 ? (
              cards.map((data,index) => (
                <Link href={data.link} key={index} className="flex justify-between  card-background gap-6 ">
                  <div>
                    <h2 className="line-clamp-2 sm:line-clamp-1 text-xl font-bold mb-2 text-gray-700">{data.title}</h2>
                    <p className="line-clamp-3 xl:line-clamp-5 text-gray-700 mb-2">{data.description}</p>
                  </div>
                
                  <Image 
                      src={data.thumbnail}
                      alt="Repo image" 
                      width={400} 
                      height={400} 
                      className="w-30 h-30 xl:w-40 xl:h-40 object-cover rounded-2xl justify-self-end"
                  />
                </Link>
              ))
          ) : (
            <p className="col-span-full text-center text-gray-500 text-lg">
              No results found
            </p>
          )
          }
        </div>
        



      </div>
      <Footer />
    </div>
  );
}

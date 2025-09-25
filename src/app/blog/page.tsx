"use client";
import Fuse from "fuse.js";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar } from "@/app/elements";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";




const BLOB  = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

interface Card {
  title: string;
  description: string;
  path: string;
  thumbnail: string;
  link: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

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
        const res = await fetch(BLOB+"/blog_pages/"+card_list[i]+"/card.json");
        const card = await res.json(); 
        console.log(card);      
        tempCards.push({ ...card, path: card_list[i], thumbnail: BLOB+"/blog_pages/"+card_list[i]+"/preview.webp", link: "blog/"+card_list[i]}); // append multiple times to temp array

      }
      if (searchQuery) {
        const fuse = new Fuse(tempCards, { keys: ["title", "description"], threshold: 0.3 });
        const results = fuse.search(searchQuery).map((result) => result.item);
        setCards(results);
      } else {
        setCards(tempCards);
      }
    }

    
    fetchCards();
  
    
  }, []);

  async function refreshSearch(query:string) {
      const res = await fetch(
        BLOB+"/blog_pages/index.json"
      );
      const card_list = await res.json();
      console.log(card_list);
      const tempCards : Card[] = [];
      for(let i=0; i<card_list.length; i++){
        console.log(i);
        const res = await fetch(BLOB+"/blog_pages/"+card_list[i]+"/card.json");
        const card = await res.json(); 
        console.log(card);      
        tempCards.push({ ...card, path: card_list[i], thumbnail: BLOB+"/blog_pages/"+card_list[i]+"/preview.webp", link: "blog/"+card_list[i]}); // append multiple times to temp array

      }
      const fuse = new Fuse(tempCards, {
        keys: ["title", "description"], // fields to search
        threshold: 0.3, // lower = stricter match
      });
      const results = query ? fuse.search(query).map(result => result.item) : tempCards;
      setCards(results);
    }
  
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 pt-30 overflow-y-auto">

      <Header/>




      <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">
        SEARCH PROJECTS
      </div>
      <div className="mb-5">
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar onSearch={refreshSearch}/>
        </Suspense>
      </div>
        <div className="min-h-screen">
          <div id="card_container" className="px-10 lg:px-50 grid grid-cols-1 gap-8">
            {cards.length > 0 ? (
              cards.map((data,index) => (
                <Link href={data.link} key={index} className="grid grid-cols-1 sm:grid-cols-2  bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-gray-700">{data.title}</h2>
                  <p className="text-gray-700 mb-2">
                      {data.description}
                  </p>
                </div>

                <Image 
                    src={data.thumbnail}
                    alt="Repo image" 
                    width={400} 
                    height={400} 
                    className=" w-full h-50 sm:w-50 object-cover rounded-2xl justify-self-end"
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

      <Footer/>


    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
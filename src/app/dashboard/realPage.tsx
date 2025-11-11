"use client";
import Fuse from "fuse.js";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar, BigSpinner } from "@/lib/elements";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderDashboard } from "../../lib/element.dashboard";
import { getBlobUrl } from "@/lib/blobInterface"


const BLOB  = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

interface Card {
  title: string;
  description: string;
  path: string;
  thumbnail: string;
  link: string;
  date: number;
}

function HomeContent() {

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function fetchCards() {

      // get list
      const res = await fetch(
        "/api/blob/get-list",
        {
          method: "GET",
          credentials: "include", // send cookies for cross-origin requests
        }
      );
      const card_list = await res.json();

      const tempCards : Card[] = [];
      for (const directory in card_list) {
        const metadataUrl = card_list[directory].find((f: { name: string; url: string }) => f.name === "metadata.json")?.url || null;
        const thumbnailUrl = card_list[directory].find((f: { name: string; url: string }) => f.name === "preview.webp")?.url || '/loading.gif';

        if(!metadataUrl)continue;
        
        const res = await fetch(metadataUrl);
        const card = await res.json(); 
        tempCards.push({ ...card, path: directory, thumbnail: thumbnailUrl, link: "dashboard/edit/"+directory}); // append multiple times to temp array
        setCards(prev => [...prev, { ...card, path: directory, thumbnail: thumbnailUrl, link: "dashboard/edit/" + directory }]);

      }
      console.log(tempCards);    

      // get link

      // display

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
      const res = await fetch(BLOB+"/blog_pages/"+card_list[i]+"/metadata.json");
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
    <div className="font-sans bg-orange-50 pt-30 overflow-y-auto">
      <div className="min-h-screen pb-10">

        <HeaderDashboard/>




        <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          SEARCH PROJECTS
        </div>
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar onSearch={refreshSearch}/>
        </Suspense>
          <div className="">
            <div id="card_container" className="px-[10%] portrait:px-[5%] max-w-[1600px] mx-auto grid grid-cols-1 gap-8">
                {cards.length > 0 ? (
                  cards.map((data,index) => (
                    <Link href={data.link} key={index} className="flex justify-between card-background gap-4 ">
                      <div className="flex flex-col h-full">
                        <h2 className="line-clamp-2 sm:line-clamp-1 text-xl font-bold mb-1 text-gray-700">{data.title}</h2>
                        <p className="line-clamp-3 xl:line-clamp-5 text-gray-700 mb-1">{data.description}</p>
                        <p className="text-xs italic text-gray-700 mt-auto">
                          {new Date(data.date * 1000).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </p>
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
      </div>
      <Footer/>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div><BigSpinner /></div>}>
      <HomeContent />
    </Suspense>
  );
}
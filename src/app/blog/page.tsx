"use client";
import Fuse from "fuse.js";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar } from "@/lib/elements";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBlobUrl } from "@/lib/blobInterface";




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

  const [cardList, setCardList] = useState<string[]>([]);
  const [allCard, setAllCard] = useState<Card[]>([]);


  useEffect(() => {
    async function fetchCards() {
      const res = await fetch(await getBlobUrl("/blog_page/index.json"));
      const list = await res.json();
      setCardList(list)
      console.log(list)
      const tempCards : Card[] = [];
      setCards(Array(list.length).fill(null));
      for(let i=0; i<list.length; i++){
        console.log(i);
        const res = await fetch(await getBlobUrl("/blog_page/"+list[i]+"/metadata.json"));
        const card = await res.json(); 

        tempCards.push({ ...card, path: list[i], thumbnail: getBlobUrl("/blog_page/"+list[i]+"/preview.webp"), link: "blog/"+list[i]}); // append multiple times to temp array
        // setCards(prev => [...prev, { ...card, path: list[i], thumbnail: getBlobUrl("/blog_page/"+list[i]+"/preview.webp"), link: "blog/"+list[i]}]);
        setCards(prev => {
          const next = [...prev];
          next[i] = { ...card, path: list[i], thumbnail: getBlobUrl("/blog_page/" + list[i] + "/preview.webp"), link: "blog/" + list[i] };
          return next;
        });
      }
      setAllCard(tempCards);
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
      // console.log(cardList);
      // const tempCards : Card[] = [];
      // for(let i=0; i<cardList.length; i++){
      //   console.log(i);
      //   const res = await fetch(await getBlobUrl("/blog_page/"+cardList[i]+"/metadata.json"));
      //   const card = await res.json(); 
      //   console.log(card);      
      //   tempCards.push({ ...card, path: cardList[i], thumbnail: getBlobUrl("/blog_page/"+cardList[i]+"/preview.webp"), link: "blog/"+cardList[i]}); // append multiple times to temp array
      //   // setCards(prev => [...prev, { ...card, path: card_list[i], thumbnail: getBlobUrl("/blog_page/"+card_list[i]+"/preview.webp"), link: "blog/"+card_list[i]}]);


      // }

      const fuse = new Fuse(allCard, {
        keys: ["title", "description"], // fields to search
        threshold: 0.3, // lower = stricter match
      });
      const results = query ? fuse.search(query).map(result => result.item) : allCard;
      setCards(results);
  }
  
  return (
    <div className="font-sans bg-orange-50 pt-30 overflow-y-auto">
      <div className="min-h-screen pb-10">

        <Header/>




        <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          SEARCH PROJECTS
        </div>
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar onSearch={refreshSearch}/>
        </Suspense>
          <div className="">
            <div id="card_container" className="px-[10%] portrait:px-[5%] max-w-[1600px] mx-auto grid grid-cols-1 gap-8">
                {cards.length > 0 ? (
                  cards.map((data, index) => 
                    <div key={index} className="relative animate-card-in">
                      <Link href={data?.link ?? "#"} className="flex justify-between card-background gap-4 transition-opacity duration-200">
                        <div className="flex flex-col h-full">
                          <h2 className="line-clamp-2 sm:line-clamp-1 text-xl font-bold mb-1 text-gray-700">{data?.title ?? ""}</h2>
                          <p className="line-clamp-3 xl:line-clamp-5 text-gray-700 mb-1">{data?.description ?? ""}</p>
                          <p className="text-xs italic text-gray-700 mt-auto">
                            {new Date((data?.date ?? 0) * 1000).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      
                        <Image 
                            src={data?.thumbnail ?? "/loading.gif"}
                            alt="Repo image" 
                            width={400} 
                            height={400} 
                            className="w-30 h-30 xl:w-40 xl:h-40 object-cover rounded-2xl justify-self-end"
                        />
                      </Link>
                      <div className={
                        "absolute inset-0 flex justify-between gap-4 card-background transition-opacity duration-400 ease-out " +
                        (data === null ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
                      }>
                        <div className="flex-1 flex flex-col h-full">
                          <div className="h-6 w-3/4 rounded-md bg-gray-200 mb-4" />
                          <div className="h-4 w-9/10 rounded-md bg-gray-200 mb-2" />
                          <div className="h-4 w-[calc(100%-5)] rounded-md bg-gray-200 mb-2" />
                          <div className="h-4 w-[calc(100%-1rem)] rounded-md bg-gray-200 mb-2" />

                          <div className="h-4 w-20 rounded-md bg-gray-200 mt-auto" />
                        </div>
                    
                      <Image src={"/loading.gif"} alt="Repo image" width={400} height={400} className="w-30 h-30 xl:w-40 xl:h-40 object-cover rounded-2xl justify-self-end" />
                      
                      </div>
                    </div>
                  )
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


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
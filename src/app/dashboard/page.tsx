"use client";
import Fuse from "fuse.js";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar, BigSpinner } from "@/lib/components/elements";
import { useContext, useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderDashboard } from "@/lib/components/element.dashboard";

import { ref, list, getDownloadURL } from "firebase/storage";
import { singletonFirebaseStorage } from "@/lib/singleton/firebaseAuth.client";
import { log } from "console";
import { logInToFirebase } from "@/lib/tokenFetcher.client";
import { AppReadyContext } from "./layout";


const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

interface Card {
  title: string;
  description: string;
  path: string;
  thumbnail: string;
  link: string;
  date: number;
}

function HomeContent() {
  const loggedInToFirebase = useContext(AppReadyContext);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if(!loggedInToFirebase) return; // wait for firebase login to complete
    async function fetchCards(folderPath: string) {
      const listRef = ref(singletonFirebaseStorage, folderPath);

      const result = await list(listRef);

      const fetchedCards = await Promise.all(
        result.prefixes.map(async folder => {
          const folderName = folder.name;

          // metadata.json
          let metadata = {
            title: "",
            description: "",
            date: 0,
          };
          try {
            const metadataRef = ref(folder, "metadata.json");
            const metadataUrl = await getDownloadURL(metadataRef);
            metadata = await fetch(metadataUrl).then(res => res.json());
          } catch {}

          // preview.webp
          let thumbnailUrl = "/loading.gif";

          try {
            const thumbnailRef = ref(folder, "preview.webp");
            thumbnailUrl = await getDownloadURL(thumbnailRef);
          } catch {}

          const toInsertCard: Card = {
            title: metadata.title,
            description: metadata.description,
            date: metadata.date,

            thumbnail: thumbnailUrl,

            path: `${folderPath}${folderName}`,
            link: `/dashboard/edit/${folderName}`,
          };
          setCards(prev => [...prev, toInsertCard].sort((a, b) => a.date > b.date ? -1 : 1));
          return toInsertCard;
        })
      );

      console.log(cards.filter(Boolean));
    }

    fetchCards("blog_page/");
    fetchCards("blog_page_protected/");
  }, [loggedInToFirebase]); // run when firebase login is done


  async function refreshSearch(query: string) {
    const res = await fetch(
      BLOB + "/blog_pages/index.json"
    );
    const card_list = await res.json();
    console.log(card_list);
    const tempCards: Card[] = [];
    for (let i = 0; i < card_list.length; i++) {
      console.log(i);
      const res = await fetch(BLOB + "/blog_pages/" + card_list[i] + "/metadata.json");
      const card = await res.json();
      console.log(card);
      tempCards.push({ ...card, path: card_list[i], thumbnail: BLOB + "/blog_pages/" + card_list[i] + "/preview.webp", link: "blog/" + card_list[i] }); // append multiple times to temp array

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

        <HeaderDashboard />




        <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          SEARCH PROJECTS
        </div>
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar onSearch={refreshSearch} />
        </Suspense>
        <div className="">
          <div id="card_container" className="px-[10%] portrait:px-[5%] max-w-[1600px] mx-auto grid grid-cols-1 gap-8">
            {cards.length > 0 ? (
              cards.map((data, index) => (
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
      <Footer />
    </div>
  );
}


export default function Page() {
  return (
    <Suspense fallback={<div><BigSpinner /></div>}>
      <HomeContent />
    </Suspense>
  );
}
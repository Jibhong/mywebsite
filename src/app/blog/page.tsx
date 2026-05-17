"use client";
import Fuse from "fuse.js";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar } from "@/lib/client/components/elements";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBlogUrl } from "@/lib/client/client.blogURLPhraser";
import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";
import { collection, getDocs } from "firebase/firestore";





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

  const [cards, setCards] = useState<(Card|null)[]>([]);

  const [allCard, setAllCard] = useState<(Card|null)[]>([]);

  const compareCardByDateDesc = (a: Card | null, b: Card | null) => (a?.date ?? 0) - (b?.date ?? 0);

  function binaryInsert<T>(
    arr: T[],
    item: T,
    compare: (a: T, b: T) => number
  ) {
    let low = 0;
    let high = arr.length;

    while (low < high) {
      const mid = (low + high) >> 1;

      if (compare(arr[mid], item) < 0) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    arr.splice(low, 0, item);
  }

  useEffect(() => {
    async function fetchCards() {
      const snapshot = await getDocs(collection(singletonFirestorePublic, "public-blog-index"));

      const folderPaths = snapshot.docs.map((doc) => doc.id);

      setCards(Array(folderPaths.length).fill(null));

      folderPaths.forEach(async (folderPath) => {
          const [res, resVersion] = await Promise.all([
            fetch(
              getBlogUrl(
                `/blog_page/${folderPath}/metadata.json`
              )
            ),
            fetch("/api/get-blog-version", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                blogId: folderPath,
              }),
            }),
          ]);

          const card = await res.json();
          const versionData = await resVersion.json();

          const version = versionData?.version ?? 0;

          const newCard: Card = {
            ...card,
            path: folderPath,
            thumbnail: `${getBlogUrl(`/blog_page/${folderPath}/preview.webp`)}&v=${version}`,
            link: `blog/${folderPath}`,
          };

          setAllCard((prev) => {
            // remove one placeholder null
            const next = [...prev];
            const nullIndex = next.indexOf(null);

            if (nullIndex !== -1) {
              next.splice(nullIndex, 1);
            }

            // insert sorted
            binaryInsert(
              next,
              newCard,
              compareCardByDateDesc
            );

            return next;
          });
      });
    }

    fetchCards();
  }, []);

  useEffect(() => {
    refreshSearch(searchQuery);
  }, [searchQuery, allCard]);

  async function refreshSearch(query: string) {
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

        <Header />




        <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          SEARCH PROJECTS
        </div>
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar redirect="blog" onSearch={refreshSearch} />
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
      <Footer />
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
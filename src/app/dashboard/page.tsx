"use client";
import Fuse from "fuse.js";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar, BigSpinner } from "@/lib/client/components/elements";
import { useContext, useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderDashboard, CardCheckboxComponent } from "@/lib/client/components/dashboard.element";

import { ref, list, getDownloadURL } from "firebase/storage";
import { singletonFirebaseStorage, singletonFirestore } from "@/lib/client/singleton/client.firebaseAuth";
import { AppReadyContext } from "./layout";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";


const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

interface Card {
  title: string;
  description: string;
  fullPath: string;
  blogId: string;
  thumbnail: string;
  link: string;
  date: number;
  isVisible: boolean;
  isPublished: boolean;
}

function HomeContent() {
  const loggedInToFirebase = useContext(AppReadyContext);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [cards, setCards] = useState<Card[]>([]);
  const [allCard, setAllCard] = useState<Card[]>([]);

  useEffect(() => {
    if (!loggedInToFirebase) return;

    async function fetchCards(
      folderPath: string,
      blogIndexMap: Map<
        string,
        {
          isPublished: boolean;
          isVisible: boolean;
        }
      >
    ) {
      const initialCards = Array.from(blogIndexMap.entries()).map(
        ([folderName, dbMeta]) => ({
          title: "Loading...",
          description: "",
          date: 0,
          thumbnail: "/loading.gif",
          fullPath: `${folderPath}${folderName}`,
          blogId: folderName,
          link: `/dashboard/edit/${folderName}`,
          isVisible: dbMeta.isVisible,
          isPublished: dbMeta.isPublished,
        })
      );

      // instantly render placeholders
      setCards(initialCards);

      const finalCards = await Promise.all(
        initialCards.map(async (baseCard) => {
          const folder = ref(singletonFirebaseStorage, baseCard.fullPath);

          let metadata = { title: "", description: "", date: 0 };

          try {
            const metadataRef = ref(folder, "metadata.json");
            const metadataUrl = await getDownloadURL(metadataRef);
            metadata = await fetch(metadataUrl).then(res => res.json());
          } catch { }

          let thumbnailUrl = "/loading.gif";

          try {
            const thumbnailRef = ref(folder, "preview.webp");
            thumbnailUrl = await getDownloadURL(thumbnailRef);
          } catch { }

          return {
            ...baseCard,
            title: metadata.title,
            description: metadata.description,
            date: metadata.date,
            thumbnail: thumbnailUrl,
          };
        })
      );

      // single source of truth
      setAllCard(finalCards);
      setCards(finalCards.sort((a, b) => b.date - a.date));
    }

    async function loadCards() {
      setCards([]);

      const snap = await getDocs(
        collection(singletonFirestore, "blog-index")
      );

      const blogIndexMap = new Map(
        snap.docs.map((doc) => [
          doc.id,
          doc.data() as {
            isPublished: boolean;
            isVisible: boolean;
          },
        ])
      );

      await fetchCards("blog_page/", blogIndexMap);
    }

    loadCards();
  }, [loggedInToFirebase]);

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

  async function refreshIndexedCardsList() {

  }

  async function updateBlogIndexValue(blogId: string, isWhatValue: boolean, isWhat: string) {

    await fetch("/api/set-blog-index", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blogId: blogId,
        [isWhat]: isWhatValue
      }),
    });
    const snap = await getDoc(doc(singletonFirestore, "blog-index", blogId));
    const data = snap.data();
    if (!data) return;
    setCards((prev) =>
      prev.map((card) =>
        card.blogId === blogId
          ? {
            ...card,
            isPublished: data.isPublished,
            isVisible: data.isVisible,
          }
          : card
      )
    );
  }



  return (
    <div className="font-sans bg-orange-50 pt-30 overflow-y-auto">
      <div className="min-h-screen pb-10">

        <HeaderDashboard />




        <div className="text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          SEARCH PROJECTS
        </div>
        <SearchBar redirect="dashboard" onSearch={refreshSearch} />
        <div id="card_container" className="px-[10%] portrait:px-[5%] max-w-[1600px] mx-auto grid grid-cols-1 gap-8">
          {cards.length > 0 ? (
            cards.map((data, index) => (
              <div key={index} className="group relative">
                {/* Card */}
                <Link href={data.link} className="flex justify-between card-background gap-4 ">
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
                    className="mr-6 w-30 h-30 xl:w-40 xl:h-40 object-cover rounded-2xl justify-self-end"
                  />
                </Link>
                {/* Hover toggle */}
                <div className="absolute top-6 right-3">
                  {/* className="absolute top-3 right-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150" */}
                  <label className="flex-col gap-2 ">
                    {/* <CheckboxComponent /> */}
                    <CardCheckboxComponent
                      isChacked={data.isPublished}
                      labelOffIcon="/icon/web-off.svg"
                      labelOnIcon="/icon/web.svg"
                      functionToCallWhenChanged={updateBlogIndexValue}
                      cardPath={data.blogId}
                      isWhat="isPublished"
                    />
                    <CardCheckboxComponent
                      isChacked={data.isVisible}
                      labelOffIcon="/icon/eye-off.svg"
                      labelOnIcon="/icon/eye.svg"
                      functionToCallWhenChanged={updateBlogIndexValue}
                      cardPath={data.blogId}
                      isWhat="isVisible"
                    />
                  </label>
                </div>
              </div>
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


export default function Page() {
  return (
    <Suspense fallback={<div><BigSpinner /></div>}>
      <HomeContent />
    </Suspense>
  );
}
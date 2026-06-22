"use client";

import Image from "next/image";
import Link from "next/link"
import { Header, Footer, SearchBar } from "@/lib/client/components/elements";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { getBlogUrl } from "@/lib/client/client.blogURLPhraser";
import { singletonFirestorePublic } from "@/lib/client/singleton/client.firebasePublic";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { FaGithub, FaLinkedin } from "react-icons/fa";


interface Card {
  title: string;
  description: string;
  path: string;
  thumbnail: string;
  link: string;
  date: number;
}

export default function Home() {

  const [cards, setCards] = useState<(Card | null)[]>([]);

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
          getDoc(doc(singletonFirestorePublic, "blog-index", folderPath))
        ]);

        const card = await res.json();
        const version = resVersion.data()?.version ?? 0;
        const newCard: Card = {
          ...card,
          path: folderPath,
          thumbnail: `${getBlogUrl(`/blog_page/${folderPath}/preview.webp`)}&v=${version}`,
          link: `blog/${folderPath}`,
        };

        setCards((prev) => {
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

  return (
    <div className="font-sans min-h-screen bg-orange-50 pt-30 overflow-y-auto ">
      <div className="min-h-screen pb-10">

        <Header />

        <div className=" px-10 flex flex-col items-center mb-16">
          <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src="/profile.webp"
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
            {"Sawasdee Krub 🙏 Lorel ipsum doraemon? sit amen condensation asparagus. Why are you still reading?"}
          </p>

          <div className="mt-6 flex space-x-4">
            <a
              href="https://github.com/Jibhong"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <FaGithub size={18} />
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/Jibhong/"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            >
              <FaLinkedin size={18} />
              LinkedIn
            </a>
          </div>
        </div>


        <div className=" text-2xl sm:text-3xl font-bold text-gray-600 text-center">
          PROJECTS
        </div>
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar redirect="blog" />
        </Suspense>

        <div id="card_container" className="px-[10%] portrait:px-[5%] max-w-[2000px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.length > 0 ? (
            cards.map((data, index) =>
              <div key={index} className="relative animate-card-in">
                <Link href={data?.link ?? "#"} key={index} className="flex justify-between  card-background gap-4 transition-opacity duration-200">
                  <div>
                    <h2 className="line-clamp-2 sm:line-clamp-1 text-xl font-bold mb-2 text-gray-700">{data?.title ?? ""}</h2>
                    <p className="line-clamp-3 xl:line-clamp-5 text-gray-700 mb-2">{data?.description ?? ""}</p>
                  </div>

                  <Image
                    // unoptimized
                    alt="Blog Preview Image"
                    src={data?.thumbnail ?? "/loading.gif"}
                    width={400}
                    height={400}
                    className="w-30 h-30 xl:w-40 xl:h-40 object-cover rounded-2xl justify-self-end"
                  />
                </Link>
                <div className={
                  "absolute inset-0 flex justify-between gap-4 card-background transition-opacity duration-400 ease-out " +
                  (data === null ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
                }>
                  <div className="flex-1">
                    <div className="h-6 w-3/4 rounded-md bg-gray-200 mb-4" />
                    <div className="h-4 w-9/10 rounded-md bg-gray-200 mb-2" />
                    <div className="h-4 w-[calc(100%-5)] rounded-md bg-gray-200 mb-2" />
                    <div className="h-4 w-[calc(100%-1rem)] rounded-md bg-gray-200 mb-2" />
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
      <Footer />
    </div>
  );
}

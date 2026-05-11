"use client";


import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import Image from "next/image";

const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

import { Header, Footer } from "@/lib/components/elements";
import { useEffect, useState } from "react";
import { getBlobUrl } from "@/lib/blobInterface";
import MarkdownComponent from "@/lib/components/markdown";

export default function Home({ params: promise_params }: { params: { slug: string } }) {
  const [markdown, setMarkdown]  = useState<string>("");
  const [metadata, setMetadata] = useState<{ title: string; description: string; date: number }>({
    title: "Loading...",
    description: "",
    date: 0,
  });
  const [formattedDateTime, setFormattedDateTime] = useState<string>("");
  
  async function initPage() {
    const params = await promise_params;
    
    const res_markdown = await fetch(getBlobUrl(`/blog_page/${params.slug}/content.md`));
    const res_metadata = await fetch(getBlobUrl(`/blog_page/${params.slug}/metadata.json`));

    if (!res_markdown.ok || !res_metadata.ok) return notFound();

    setMarkdown(await res_markdown.text());
    const res_metadata_json = await res_metadata.json();
    setMetadata(res_metadata_json); 

    const metadata_timestamp = Number(res_metadata_json.date) * 1000; // convert to milliseconds
    const metadata_date = new Date(metadata_timestamp);

    const metadata_formattedDate = metadata_date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const metadata_formattedTime = metadata_date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(":", ".");

    setFormattedDateTime(`${metadata_formattedDate} (${metadata_formattedTime})`);
  }
  useEffect(() => {
    initPage();
  }, []);
//   const markdown = `

// # 👋 Hello, I'm Jibhong

// I'm a self-taught developer currently studying at Triam Udom Suksa School.

// I'm Interested in Competitive Programming, Web Development, AI and Game Development.

// I also do some 3D modeling, and fursuit making as a hobby.

// ## 🌳 My Forest (The Greener The Better)


// ## 💻 Actually Stacking Tech
// ![A beautiful sunrise](https://go-skill-icons.vercel.app/api/icons?i=bash,c,c,c,c,c,c,c,c,c,c,cs,cpp,css,tailwindcss,html,javascript,typescript,luau,python")


// `
  return (
     <div className="pt-30 font-sans bg-orange-50 min-h-screen flex flex-col">
      <Header />
      {/* Container */}
      <main className="flex-1 flex justify-center items-start">
        <div className="container max-w-3xl mx-auto p-6 min-h-screen">

          <div className="mb-15">
            <div className="italic mb-5 text-sm justify-end flex space-x-4 text-gray-600 text-sm">
              {formattedDateTime}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              {metadata.title}
            </h1>
            <h2 className="text-lg  text-gray-900 mb-4">
              {metadata.description}
            </h2>
            <hr className="my-4 border-t border-gray-600" />
          </div>

          <article className="mb-20 break-words text-red-500 prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-li:marker:text-purple-600">
            <MarkdownComponent markdown={markdown} />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

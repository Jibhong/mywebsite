"use client";


import Markdown from "react-markdown";
import { notFound } from "next/navigation";

const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

import { Header, Footer } from "@/lib/elements";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { getBlobUrl } from "@/lib/blobInterface";
import React from "react";


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
    
    const res_markdown = await fetch(await getBlobUrl(`/blog_page/${params.slug}/content.md`));
    const res_metadata = await fetch(await getBlobUrl(`/blog_page/${params.slug}/metadata.json`));

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
type RMImgProps = React.ComponentPropsWithoutRef<"img">;

const MarkdownImage: React.FC<RMImgProps> = ({ src, alt, width, height, ...imgProps }) => {
  const [isFetching, setIsFetching] = React.useState(true);

  // Turn width/height from string|number|undefined into a strict number
  const parseDim = (v: string | number | undefined, fallback: number) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
  };

  // defaults if not provided by markdown
  const w = parseDim(width, 800);
  const h = parseDim(height, 450);

  if (!src) return null; // defensive

  return (
    <span className="relative block w-full" {...(imgProps)}>
      {isFetching && (
        <span
          className="block rounded-lg w-full bg-gray-300 animate-pulse"
          style={{ paddingTop: `${(h / w) * 100}%` }}
        />
      )}
      <span className="rounded-lg overflow-hidden relative max-h-[80vh] flex justify-center items-center">
      <Image
        src={String(src)}
        alt={alt ?? ""}
        width={w}
        height={h}
        sizes="(max-width: 768px) 100vw, 800px"
        loading="lazy"
        onLoad={() => setIsFetching(false)}
        onError={() => setIsFetching(false)}
        className={
          `rounded-lg object-contain h-auto max-w-full w-full mx-auto max-h-[80vh] transition-opacity duration-500 ` +
          (isFetching ? "opacity-0 absolute" : "opacity-100 relative")
        }
      />
      </span>
    </span>
  );
};

MarkdownImage.displayName = "MarkdownImage";

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
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-semibold text-gray-700 mt-8 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-lg leading-relaxed text-gray-800 mb-4">{children}</p>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 space-y-2">{children}</ol>
                ),
                li: ({ children }) => <li className="text-gray-800">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 bg-blue-50 py-2">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-200 px-2 py-0.5 rounded text-sm font-mono text-pink-600">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                img: MarkdownImage, // use uppercase component here


                hr: () => <hr className="my-8 border-t border-gray-300" />,
              }}
            >
              {markdown}
            </Markdown>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

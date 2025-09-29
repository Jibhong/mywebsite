"use client";


import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import { useRef } from "react";


const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

import { Header, Footer } from "@/app/lib/elements";
import Image from "next/image";

import { useEffect, useState } from "react";
import { HeaderDashboard } from "@/app/lib/element.dashboard";


interface Metadata {
  title: string;
  description: string;
  date: number; // unix timestamp (seconds)
}
export default function HomeContent() {

  const [preview, setPreview] = useState<number>(0);
  const [text, setText] = useState<string>("# Hello Markdown!");

  const [formattedDateTime, setFormattedDateTime] = useState<string>();
  const [title, setTitle] = useState<string>("Title");
  const [description, setDescription] = useState<string>("Description");

  const [markdown, setMarkdown]  = useState<string>("# Markdown");


  async function markdownPreview(e: React.ChangeEvent<HTMLTextAreaElement>) {
      setMarkdown(e.target.value);
      updateTextArea();
  }

  async function updateTextArea() {
    const el = document.getElementById("markdown-textarea") as HTMLTextAreaElement | null;
    if (el) {
      el.style.height = "auto"; // reset before recalculating
      el.style.height = el.scrollHeight + "px";
    }
  }

  useEffect(() => {
    updateTextArea();
  }, [preview]);

  useEffect(() => {
    const interval = setInterval(() => {
      const metadata_timestamp = Date.now(); // millisecond
      const metadata_date = new Date(metadata_timestamp);

      const metadata_formattedDate = metadata_date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const metadata_formattedTime = metadata_date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
        hour12: false,
      }).replace(":", ".");

      const newFormattedDateTime = `${metadata_formattedDate} (${metadata_formattedTime})`;
      if(formattedDateTime == newFormattedDateTime) return;

      setFormattedDateTime(newFormattedDateTime);

    }, 1000);
    return () => clearInterval(interval);
  },[])

  return (
     <div className="pt-30 font-sans bg-orange-50 min-h-screen flex flex-col">
      <HeaderDashboard />

      <main className="flex-1 flex-col max-w-auto">
        <div className="mb-4 flex  max-w-3xl mx-auto gap-2">
          <button
            onClick={() => setPreview(0)}
            className={`px-4 py-2 rounded ${
              preview!=0 ?  "bg-blue-500" : "bg-gray-200 text-white"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreview(1)}
            className={`px-4 py-2 rounded ${
              preview!=1 ? "bg-blue-500" : "bg-gray-200 text-white"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setPreview(2)}
            className={`px-4 py-2 rounded ${
              preview!=2 ? "bg-blue-500" : "bg-gray-200 text-white"
            }`}
          >
            Compare
          </button>
        </div>
        <div className="flex">
          {preview==0 || preview==2 ? (
            <div className="container max-w-3xl mx-auto mb-20">
              <div className="border rounded-lg border-gray-600 p-6 mb-auto">
                <textarea
                  id="markdown-textarea"
                  className="flex text-gray-600 w-full resize-none overflow-hidden border-hidden outline-none rounded font-mono"
                  value={markdown}
                  onChange={(e) => markdownPreview(e)}
                />
              </div>
            </div>
          ):(<div></div>)}
          {preview==1 || preview==2 ? (
            <div className="container max-w-3xl mx-auto p-6 min-h-screen">

              <div className="mb-15">
                <div className="italic mb-5 text-sm justify-end flex space-x-4 text-gray-600 text-sm">
                  {formattedDateTime}
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                  {title}
                </h1>
                <h2 className="text-lg  text-gray-900 mb-4">
                  {description}
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
                    img: ({ src, alt }) => (
                      <Image
                        src={src as string}
                        alt={alt || "image"}
                        fill
                        className="rounded-lg my-6 object-cover"
                      />
                    ),
                    hr: () => <hr className="my-8 border-t border-gray-300" />,
                  }}
                >
                  {markdown}
                </Markdown>
              </article>
            </div>
          ):(<div></div>)}
        </div>
      </main>

      <Footer />
    </div>
  );
}
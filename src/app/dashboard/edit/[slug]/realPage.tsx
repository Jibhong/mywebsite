"use client";


import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import { useRef } from "react";


const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

import { Header, Footer } from "@/lib/elements";
import Image from "next/image";

import { useEffect, useState } from "react";
import { HeaderDashboard } from "@/lib/element.dashboard";
import { upload } from "@vercel/blob/client";

import { getBlobUrl } from "@/lib/blobInterface";



interface Metadata {
  title: string;
  description: string;
  date: number; // unix timestamp (seconds)
}

interface BlogDataProps {
  markdown: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface NewPageProps {
  slug: string;
  blogDataUrlPair: { name: string; url: string; }[]; // <-- use a prop name, not the interface directly
}

export default function HomeContent( { slug: slug, blogDataUrlPair: blogDataUrl }: NewPageProps ) {

  const [preview, setPreview] = useState<number>(0);

  const [formattedDateTime, setFormattedDateTime] = useState<string>();
  const [title, setTitle] = useState<string>("Title");
  const [description, setDescription] = useState<string>("Description");
  const [thumbnail, setThumbnail] = useState<string>("/profile.png")

  const [markdown, setMarkdown]  = useState<string>("# Markdown");


  async function markdownPreview(e: React.ChangeEvent<HTMLTextAreaElement>) {
      setMarkdown(e.target.value);
  }

  useEffect(() => {
    async function updateTextArea() {
      const el = document.getElementById("markdown-textarea") as HTMLTextAreaElement | null;
      if (el) {
        el.style.height = "auto"; // reset before recalculating
        el.style.height = el.scrollHeight + "px";
      }
    }

    updateTextArea();
  }, [markdown, preview]);

  async function uploadPreviewImage() {
    
  }

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


  const [width, setWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<null | "left" | "right">(null);
  const startX = useRef(0);
  const startWidth = useRef(width);

  const handleMouseDown = (side: "left" | "right", e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = side;
    startX.current = e.clientX;
    startWidth.current = width;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const deltaX = e.clientX - startX.current;

    if (isResizing.current === "right") {
      setWidth(Math.min(Math.max(startWidth.current + deltaX * 2, 400),768));
    } else if (isResizing.current === "left") {
      setWidth(Math.min(Math.max(startWidth.current - deltaX * 2, 400),768));
    }
    
  };

  const handleMouseUp = () => {
    isResizing.current = null;
  };

  useEffect(() => {
    // Attach global listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);


  useEffect(() => {
    async function loadContent() {
      
      console.log(slug)
      console.log(blogDataUrl)

      const found_markdown = blogDataUrl.find(file => file.name === "content.md");
      let res_markdown = null;

      if (found_markdown) {
        res_markdown = await fetch(found_markdown.url);
      }
      const markdown = await res_markdown?.text();
      if(markdown) setMarkdown(markdown);

      
      
      
      const found_metadata = blogDataUrl.find(file => file.name === "metadata.json");
      if (found_metadata) {
        const metadata = await (await fetch(found_metadata.url)).json();
        if(metadata) setTitle(metadata.title);
        if(metadata) setDescription(metadata.description);
      }


      // get preview.webp url
      const thumbnail = blogDataUrl.find(file => file.name === "preview.webp")?.url;
      if(thumbnail) setThumbnail(thumbnail);
      




      // setMarkdown(blogData.markdown);
      // setTitle(blogData.title);
      // setDescription(blogData.description);
      // setThumbnail(blogData.thumbnail);
      
    }
    loadContent();
    
    
  }, []);

  return (
     <div className="pt-30 font-sans bg-orange-50 min-h-screen flex flex-col">
      <HeaderDashboard />

      <main className="flex-1 flex-col max-w-auto">
        <div className="mb-4 flex max-w-3xl mx-auto justify-between border rounded-2xl border-gray-400 p-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPreview(0)}
              className={`px-4 py-2 rounded-lg transition ${
                preview!=0 ?  "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer" : "bg-orange-200 text-white"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setPreview(1)}
              className={`px-4 py-2 rounded-lg transition ${
                preview!=1 ? "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer" : "bg-orange-200 text-white"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setPreview(2)}
              className={`px-4 py-2 rounded-lg transition ${
                preview!=2 ? "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer" : "bg-orange-200 text-white"
              }`}
            >
              Compare
            </button>
          </div>
          <div className="flex gap-2 ">
            <button
              onClick={() => setPreview(0)}
              className={`px-4 py-2 rounded-lg transition ${
                "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer"
              }`}
            >
              Load
            </button>
            <button
              onClick={() => setPreview(1)}
              className={`px-4 py-2 rounded-lg transition ${
                "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer"
              }`}
            >
              Save
            </button>
            <button
              onClick={() => setPreview(2)}
              className={`px-4 py-2 rounded-lg transition ${
                "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer"
              }`}
            >
              Publish
            </button>
          </div>
        </div>
        <div className="flex">
          {preview==0 || preview==2 ? (
            <div className="container max-w-3xl mx-auto mb-20">

              <div className="w-full flex mb-4 items-center justify-center">
                <div
                  className="relative max-h-60 flex items-center justify-center"
                  style={{ width }}
                >

                  <div  className="flex justify-between w-full max-w-3xl mx-4 card-background gap-4 ">

                    <div>
                      <h2 className="line-clamp-2 sm:line-clamp-1 text-xl font-bold mb-2 text-gray-700">{title}</h2>
                      <p className="line-clamp-3 xl:line-clamp-5 text-gray-700 mb-2">{description}</p>
                    </div>
                  
                    <Image
                      src={thumbnail}
                      alt="Profile image"
                      width={400}
                      height={400}
                      className="w-30 h-30 xl:w-40 xl:h-40 object-cover rounded-2xl hover:cursor-pointer"
                      onClick={() => console.log("clicked!")}
                    />
                    
                  </div>

                  {/* Left handle */}
                  <div
                    className="absolute left-0 top-[25%] h-[50%] w-2 cursor-ew-resize bg-orange-400 hover:bg-orange-300 transition rounded-2xl"
                    onMouseDown={(e) => handleMouseDown("left", e)}
                  />

                  {/* Right handle */}
                  <div
                    className="absolute right-0 top-[25%] h-[50%] w-2 cursor-ew-resize bg-orange-400 hover:bg-orange-300 transition rounded-2xl"
                    onMouseDown={(e) => handleMouseDown("right", e)}
                  />
                </div>
              </div>

              <div className="border rounded-2xl border-gray-400  p-6 mb-auto pt-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-gray-600 border-b border-gray-400 focus:border-orange-400 outline-none font-mono pb-1 mt-3"
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-gray-600 border-b border-gray-400 focus:border-orange-400 outline-none font-mono pb-1 mt-3"
                />
                <textarea
                  id="markdown-textarea"
                  placeholder="# Markdown"
                  className="flex text-gray-600 w-full resize-none rounded-lg border border-gray-400 focus:border-orange-400 overflow-hidden outline-none  font-mono mt-3 p-6"
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
                        width={800}
                        height={450}
                        sizes="(max-width: 768px) 100vw, 800px"
                        loading="lazy"
                        className="rounded-lg object-contain h-auto max-w-full w-auto mx-auto"
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
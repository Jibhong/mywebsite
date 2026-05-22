"use client";


import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import { useRef } from "react";



import { Header, Footer } from "@/lib/client/components/elements";
import Image from "next/image";

import { useEffect, useState } from "react";
import { HeaderDashboard } from "@/lib/client/components/dashboard.element";
import MarkdownComponent from "@/lib/client/components/markdown";

// Firebase stuffs
import { singletonFirebaseStorage, singletonFirestore } from "@/lib/client/singleton/client.firebaseAuth";
import { ref, list, getDownloadURL } from "firebase/storage";
import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { metadata } from "@/app/layout";
import { FileManager } from "@/lib/client/components/dashboard.edit.element";

export default function Home({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const SLUG = resolvedParams.slug;
  const [renderPreview, setRenderPreview] = useState<number>(0);
  const [renderMode, setRenderMode] = useState<string>("preview");

  const [formattedDateTime, setFormattedDateTime] = useState<string>();
  const [title, setTitle] = useState<string>("Title");
  const [description, setDescription] = useState<string>("Description");
  const [thumbnail, setThumbnail] = useState<string>("/loading.gif");
  const [markdown, setMarkdown] = useState<string>("# Markdown");

  const [isPublished, setIsPublished] = useState<boolean>();
  const [isVisible, setIsVisible] = useState<boolean>();



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
  }, [markdown, renderPreview, renderMode]);

  async function uploadPreviewImage() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      const formData = new FormData();

      formData.append("previewImage", file);
      formData.append("blogId", SLUG);

      const res = await fetch("/api/edit/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload preview image");
      } else {
        const fileRef = ref(singletonFirebaseStorage, `blog_page/${SLUG}/preview.webp`);
        const imageUrl = await getDownloadURL(fileRef);
        setThumbnail(imageUrl)
      }

      console.log(await res.json());
    };

    input.click();
  }

  // Update formattedDateTime every second
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
      if (formattedDateTime == newFormattedDateTime) return;

      setFormattedDateTime(newFormattedDateTime);

    }, 1000);
    return () => clearInterval(interval);
  }, [])


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
      setWidth(Math.min(Math.max(startWidth.current + deltaX * 2, 400), 768));
    } else if (isResizing.current === "left") {
      setWidth(Math.min(Math.max(startWidth.current - deltaX * 2, 400), 768));
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

  async function fetchBlogData(): Promise<{ name: string; url: string }[]> {
    let listRef = ref(singletonFirebaseStorage, `blog_page/${SLUG}/`);
    let result = await list(listRef);

    if (result.items.length === 0) {
      console.log("Fetching firestore data at:", `blog_page_protected/${SLUG}/`);
      listRef = ref(singletonFirebaseStorage, `blog_page_protected/${SLUG}/`);
      result = await list(listRef);
    } else {
      console.log("Fetching firestore data at:", `blog_page/${SLUG}/`);
    }
    console.log("Result received:", result);

    const blogDataUrlPair = await Promise.all(
      result.items.map(async (item) => ({
        name: item.name,
        url: await getDownloadURL(item),
      }))
    );

    console.log("blogDataUrlPair:", blogDataUrlPair);
    return blogDataUrlPair;
  }
  // Load content
  useEffect(() => {
    async function loadContent() {
      const blogDataUrlPair = await fetchBlogData();
      console.log(SLUG)
      console.log(blogDataUrlPair)

      const found_markdown = blogDataUrlPair.find(file => file.name === "content.md");
      let res_markdown = null;
      if (found_markdown) {
        res_markdown = await fetch(found_markdown.url);
      }
      const markdown = await res_markdown?.text();
      if (markdown) setMarkdown(markdown);




      const found_metadata = blogDataUrlPair.find(file => file.name === "metadata.json");
      if (found_metadata) {
        const metadata = await (await fetch(found_metadata.url)).json();
        if (metadata) setTitle(metadata.title);
        if (metadata) setDescription(metadata.description);
      }


      // get preview.webp url
      const thumbnail = blogDataUrlPair.find(file => file.name === "preview.webp")?.url;
      if (thumbnail) setThumbnail(thumbnail);





      // setMarkdown(blogData.markdown);
      // setTitle(blogData.title);
      // setDescription(blogData.description);
      // setThumbnail(blogData.thumbnail);

    }
    loadContent();


  }, []);

  // Load Publication Status
  async function loadPublicationStatus() {
    const snap = await getDoc(doc(singletonFirestore, "blog-index", SLUG));
    if (!snap.exists) return;
    const snapData = snap.data();
    if (!snapData) return;
    setIsPublished(snapData.isPublished);
    setIsVisible(snapData.isVisible);
  }
  useEffect(() => {
    loadPublicationStatus();
  }, []);

  async function buttonSave() {

    const formData = new FormData();
    const metadata = {
      title,
      description,
      date: Math.floor(Date.now() / 1000),
    };
    formData.append("markdown", markdown);
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("blogId", SLUG);

    const res = await fetch("/api/edit/upload", {
      method: "POST",
      body: formData,
    });

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
    await loadPublicationStatus();
  }

  async function buttonFileManager() {
    setRenderMode("fileManager")
  }

  return (
    <div className="pt-30 font-sans bg-orange-50 min-h-screen flex flex-col">
      <HeaderDashboard />
      <main className="flex-1 flex-col max-w-auto mx-4">
        {/* button tab */}
        <div className="relative mb-4 max-w-3xl mx-auto justify-between border rounded-2xl border-gray-400 py-2 px-2">
          <button
            onClick={() => setRenderMode("preview")}
            className={`px-2 py-2 rounded-lg transition ${renderMode == "preview" ? "bg-orange-300" : " hover:cursor-pointer"}`}
          >
            <Image
              src="/icon/text-box-edit-outline.svg"
              alt="fileManagerButton"
              width={25}
              height={25}
            />
          </button>
          <button
            onClick={() => buttonFileManager()}
            className={`px-2 py-2 rounded-lg transition ${renderMode == "fileManager" ? "bg-orange-300" : " hover:cursor-pointer"}`}
          >
            <Image
              src="/icon/folder-outline.svg"
              alt="fileManagerButton"
              width={25}
              height={25}
            />
          </button>
        </div>

        {renderMode == "preview" ? (
          <div>
            <div className="mb-4 flex max-w-3xl mx-auto justify-between border rounded-2xl border-gray-400 p-6">
              <div className="flex gap-2 text-white">
                <button
                  onClick={() => setRenderPreview(0)}
                  className={`px-4 py-2 rounded-lg transition ${renderPreview != 0 ? "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer" : "bg-orange-200 text-white"}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setRenderPreview(1)}
                  className={`px-4 py-2 rounded-lg transition ${renderPreview != 1 ? "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer" : "bg-orange-200 text-white"}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setRenderPreview(2)}
                  className={`px-4 py-2 rounded-lg transition ${renderPreview != 2 ? "bg-orange-400 hover:bg-orange-300 hover:cursor-pointer" : "bg-orange-200 text-white"}`}
                >
                  Compare
                </button>
              </div>
              <div className="flex gap-2 text-white">
                <button
                  onClick={() => buttonSave()}
                  className={`px-4 py-2 rounded-lg transition ${"bg-orange-400 hover:bg-orange-300 hover:cursor-pointer"}`}
                >
                  Save
                </button>
                <button
                  onClick={() => updateBlogIndexValue(SLUG, !isPublished, "isPublished")}
                  className={`px-4 py-2 rounded-lg transition ${"bg-orange-400 hover:bg-orange-300 hover:cursor-pointer"}`}
                >
                  {isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => updateBlogIndexValue(SLUG, !isVisible, "isVisible")}
                  className={`px-4 py-2 rounded-lg transition ${"bg-orange-400 hover:bg-orange-300 hover:cursor-pointer"}`}
                >
                  {isVisible ? "Unlist" : "List"}
                </button>
              </div>

            </div>
            <div className="flex">
              {renderPreview == 0 || renderPreview == 2 ? (
                <div className="container max-w-3xl mx-auto mb-20">

                  <div className="w-full flex mb-4 items-center justify-center">
                    <div
                      className="relative max-h-60 flex items-center justify-center"
                      style={{ width }}
                    >

                      <div className="flex justify-between w-full max-w-3xl mx-4 card-background gap-4 ">

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
                          onClick={() => uploadPreviewImage()} />

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

              ) : (null)}
              {renderPreview == 1 || renderPreview == 2 ? (
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
                    <MarkdownComponent markdown={markdown} />
                  </article>
                </div>
              ) : (null)}
            </div>
          </div>) : (null)}

        <div className={renderMode === "fileManager" ? "block" : "hidden"}>
          <FileManager blogId={SLUG} />
        </div>

      </main>

      <Footer />
    </div>
  );
}
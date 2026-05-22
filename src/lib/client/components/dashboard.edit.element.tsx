"use client"
import { isFirebaseLoginContext } from "@/app/dashboard/layout";
import { singletonFirebaseStorage } from "@/lib/client/singleton/client.firebaseAuth";
import { getDownloadURL, list, ref } from "firebase/storage";
import { getPlaceholderFallbackRouteParams } from "next/dist/server/request/fallback-params";
import Link from "next/link";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { upload } from "@vercel/blob/client";
import { getBlogUrl } from "@/lib/client/client.blogURLPhraser";

type FileManagerProp = {
    blogId: string;
}
type Card = {
    name: string;
    type: string;
    url: string;
    aspectRatio: number;
}


export function FileManager({ blogId }: FileManagerProp) {
    const loggedInToFirebase = useContext(isFirebaseLoginContext);
    const [cards, setCards] = useState<(Card | null)[]>([]);
    async function getImageAspectRatio(url: string): Promise<number> {
        return new Promise((resolve) => {
            const img = new window.Image();

            img.onload = () => {
                resolve(img.width / img.height);
            };

            img.onerror = () => {
                resolve(2);
            };

            img.src = url;
        });
    }

    async function loadCard(item: any): Promise<Card> {
        const url = await getDownloadURL(item);
        const isImageFile = (name: string) => {
            const ext = name.split(".").pop()?.toLowerCase() || "";
            return ["png", "jpg", "jpeg", "webp", "gif", "avif"].includes(ext);
        };
        const image = isImageFile(item.name);
        const aspectRatio = image ? await getImageAspectRatio(url) : 2;

        return {
            name: item.name,
            type: image ? "image" : "",
            url,
            aspectRatio,
        };
    }

    async function fetchAllFile() {
        const folder = ref(singletonFirebaseStorage, `blog_page/${blogId}/file`);
        const result = await list(folder);

        setCards((prev) => {
            const prevMap = new Map(
                prev
                    .filter(Boolean)
                    .map((card) => [card!.name, card!])
            );

            // keep existing cards
            // insert null for new cards
            // remove deleted cards
            return result.items.map((item) => {
                return prevMap.get(item.name) ?? null;
            });
        });

        // fetch missing cards in parallel
        await Promise.all(
            result.items.map(async (item) => {
                setCards((prev) => {
                    const alreadyLoaded = prev.some(
                        (card) => card?.name === item.name
                    );

                    if (alreadyLoaded) return prev;

                    return prev;
                });

                const currentExists = cards.some(
                    (card) => card?.name === item.name
                );

                if (currentExists) return;

                const loadedCard = await loadCard(item);

                setCards((prev) => {
                    const next = [...prev];

                    const targetIndex = result.items.findIndex(
                        (x) => x.name === item.name
                    );

                    next[targetIndex] = loadedCard;

                    return next;
                });
            })
        );
    }

    useEffect(() => {
        if (!loggedInToFirebase) return;
        fetchAllFile();
    }, [loggedInToFirebase]);

    async function deleteFile(fileName: string) {
        const confirmed = window.confirm(`Delete "${fileName}" ?`);
        if (!confirmed) return;
        const formData = new FormData();

        formData.append("blogId", blogId);
        formData.append("file", fileName);

        const res = await fetch("/api/edit/delete", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            fetchAllFile();
        }
    }


    const [uploadFileFile, setUploadFileFile] = useState<File | null>(null);
    const [uploadFileName, setUploadFileName] = useState("");
    async function uploadFileSelectFile() {
        const input = document.createElement("input");

        input.type = "file";

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            setUploadFileFile(file);
            setUploadFileName(file.name);
        }
        input.click();
    }
    async function uploadFileUpload() {
        const formData = new FormData();
        if (!uploadFileFile || !uploadFileName) return;
        formData.append("blogId", blogId);
        formData.append("uploadFile", uploadFileFile as File);
        formData.append("uploadFileName", uploadFileName);
        setUploadFileFile(null);
        setUploadFileName("");
        const res = await fetch("/api/edit/upload", {
            method: "POST",
            body: formData,
        });
        if (res.ok) {
            fetchAllFile();
        }
    }

    async function copyPublicUrl(fileName: string) {
        const publicUrl = getBlogUrl(`blog_page/${blogId}/file/${fileName}`);
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Copied URL");
    }

    return (<div className="mb-20 justify-items-center max-w-6xl w-full mx-auto p-6 pt-0 gap-4">
        <Toaster />
        <div className="mb-4 flex w-full max-w-3xl mx-auto justify-between border rounded-2xl border-gray-400 py-0 px-1">
            <div className="flex flex-1">
                <button
                    onClick={() => uploadFileSelectFile()}
                    className={`px-2 py-2 rounded-lg transition hover:cursor-pointer`}
                >
                    <Image
                        src="/icon/file-upload-outline.svg"
                        alt="fileManagerButton"
                        width={25}
                        height={25}
                    />
                </button>
                <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="File Name"
                    className="px-1 py-2 outline-none flex-1"
                />
            </div>
            <button
                onClick={() => uploadFileUpload()}
                className={`px-2 py-2 rounded-lg transition hover:cursor-pointer`}
            >
                <Image
                    src="/icon/upload-outline.svg"
                    alt="fileManagerButton"
                    width={25}
                    height={25}
                />
            </button>
        </div>

        <div className="mb-8 w-full">

            {cards.map((data, index) => data?.type != "image" && data != null ? (
                <div key={index} className="flex animate-card-in rounded-xl px-4 py-1 min-w-0 w-full my-2 bg-white shadow-lg hover:shadow-xl transition">
                    <button
                        type="button"
                        onClick={async () => copyPublicUrl(data.name)}
                        className="mr-6 truncate hover:cursor-pointer"
                    >
                        {data?.name}
                    </button>
                    <div className="absolute right-2">

                        <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center hover:cursor-pointer"
                            onClick={() => deleteFile(data.name)}
                        >
                            <Image
                                src={"/icon/delete-forever-outline.svg"}
                                alt="toggle"
                                width={24}
                                height={24}
                            />
                        </button>
                    </div>

                </div>
            ) : null)}
        </div>

        <div className="grid grid-flow-dense grid-cols-[repeat(auto-fit,minmax(200px,1fr))] justify-items-center w-full mx-auto gap-4">
            {cards.map((data, index) => data?.type == "image" ? (

                <div key={index} className="group flex-col relative animate-card-in w-full overflow-hidden rounded-md shadow-lg bg-white hover:shadow-xl transition hover:cursor-pointer" style={{ aspectRatio: data?.aspectRatio ?? 1 }} >
                    <Image
                        onClick={async () => copyPublicUrl(data.name)}
                        alt="File Name"
                        src={data?.type == "image" ? data.url : "/loading.gif"}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute right-2 top-2 bg-white rounded-sm">
                        <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center hover:cursor-pointer"
                            onClick={(e) => deleteFile(data.name)}
                        >
                            <Image
                                src={"/icon/delete-forever-outline.svg"}
                                alt="toggle"
                                width={24}
                                height={24}
                            />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white px-2 py-1 text-sm truncate backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {data?.name}
                    </div>
                </div>

            ) : null)}

        </div>
    </div>
    )
}
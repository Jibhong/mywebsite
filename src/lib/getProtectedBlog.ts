import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTokenServer } from "@/lib/tokenAuth.server";
import { getAllBlogPath } from "@/lib/firebaseInterface";
import { getProtectedFilesUrls } from "@/lib/firebaseInterface";
import path from "path";
import { url } from "inspector";

export async function getProtectedBlog(slug:string): Promise<{name:string, url:string}[]>{

  const allPath = (await getAllBlogPath()) ?? [];

  const match = allPath.find(
    (folder) =>
      folder === `blog_page/${slug}/` || folder === `blog_page_protected/${slug}/`
  );
  if (!match) {
    return [];
  }


  const urls = (await getProtectedFilesUrls(match)) ?? [];
  return urls;
}

import { getAllBlogPath } from "@/lib/firebaseInterface";
import { getProtectedFilesUrls } from "@/lib/firebaseInterface";

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

import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";


const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

import { Header, Footer, SearchBar } from "@/app/elements";



export default async function BlogPage({ params: promise_params }: { params: { slug: string } }) {
  const params = await promise_params
  const res = await fetch(`${BLOB}/blog_pages/${params.slug}/content.md`);
  if (!res.ok) return  notFound();

  const markdown = await res.text();

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 pt-30 overflow-y-auto">
      <Header />

      <ReactMarkdown>{markdown}</ReactMarkdown>

      <Footer />
    </div>
  );
}

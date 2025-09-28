import Markdown from "react-markdown";
import { notFound } from "next/navigation";

const BLOB = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL;

import { Header, Footer } from "@/app/lib/elements";

export default async function BlogPage({ params: promise_params }: { params: { slug: string } }) {
  const params = await promise_params;

  const res_markdown = await fetch(`${BLOB}/blog_pages/${params.slug}/content.md`);
  const res_meetadata = await fetch(`${BLOB}/blog_pages/${params.slug}/metadata.json`)

  if (!res_markdown.ok || !res_meetadata.ok) return notFound();

  const markdown = await res_markdown.text();
  const metadata = await res_meetadata.json(); 

  const metadata_timestamp = metadata.date * 1000; // convert to milliseconds
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

  const formattedDateTime = `${metadata_formattedDate} (${metadata_formattedTime})`;

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
                  <img
                    src={src || ""}
                    alt={alt || ""}
                    className="rounded-lg my-6 max-w-full"
                  />
                ),
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

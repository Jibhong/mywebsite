// components/MarkdownRenderer.tsx

import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import React from "react";

type Props = {
  markdown: string;
};

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

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-4">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="text-2xl font-semibold text-gray-700 mt-8 mb-3">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="text-lg leading-relaxed text-gray-800 mb-4">
      {children}
    </p>
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
    <ul className="list-disc pl-6 space-y-2">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="text-gray-800">
      {children}
    </li>
  ),

  blockquote: ({ children }) => (
    <blockquote className="rounded-sm border-l-6 border-amber-400 pl-4 italic text-gray-700 bg-amber-100 py-2">
      <div className="[&>p]:mb-0">
        {children}
      </div>
    </blockquote>
  ),
  // ``` ``` and ``
  code(props) {
    const { children, className, node } = props;

    // detect ``` fenced block
    const isBlock = node?.position?.start.line !== node?.position?.end.line;

    if (isBlock) {
      return (
        <code className="font-mono text-sm">
          {children}
        </code>
      );
    }

    // detect `inline`
    return (
      <code className="bg-gray-200 px-2 py-0.5 rounded text-sm font-mono text-pink-600">
        {children}
      </code>
    );
  },
  //bg for ``` ```
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
      {children}
    </pre>
  ),

  img: MarkdownImage,

  hr: () => (
    <hr className="my-8 border-t border-gray-300" />
  ),
  // table
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-orange-400 text-white">
      {children}
    </thead>
  ),

  tbody: ({ children }) => (
    <tbody>
      {children}
    </tbody>
  ),

  tr: ({ children }) => (
    <tr className="bg-slate-200 border-t border-gray-300">
      {children}
    </tr>
  ),

  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold border border-gray-300 text-white bg-slate-700">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="px-4 py-2 border border-gray-300">
      {children}
    </td>
  ),
};

export default function MarkdownComponent({ markdown }: Props) {
  return (
    <article>
      <Markdown components={components} remarkPlugins={[remarkGfm]} >
        {markdown}
      </Markdown>
    </article>
  );
}
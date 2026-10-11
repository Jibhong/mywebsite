// components/MarkdownRenderer.tsx

import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import React from "react";

type Props = {
  markdown: string;
};

type MediaProps = {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  kind: "image" | "video";
};

const parseDim = (v: string | number | undefined, fallback: number) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
};

const MarkdownMedia: React.FC<MediaProps> = ({ src, alt, width, height, kind }) => {
  const [isFetching, setIsFetching] = React.useState(true);

  if (!src) return null;

  const w = parseDim(width, 800);
  const h = parseDim(height, 450);
  const done = () => setIsFetching(false);

  // no w-full: media keeps its natural size, capped by width and 80vh.
  // The aspect ratio is preserved, so the frame wraps what is actually drawn.
  const mediaClass =
    "block h-auto w-auto max-w-full max-h-[80vh] transition-opacity duration-500 " +
    (isFetching ? "opacity-0 absolute inset-0" : "opacity-100 relative");

  return (
    <span className="relative block w-full my-6">
      {isFetching && (
        <span
          className="block rounded-lg w-full bg-gray-300 animate-pulse"
          style={{ paddingTop: `${(h / w) * 100}%` }}
        />
      )}
      {/* frame: shrink-wraps the media, clips corners, centered */}
      <span
        className={
          "relative mx-auto block w-fit max-w-full overflow-hidden rounded-lg " +
          (isFetching ? "absolute inset-0" : "")
        }
      >
        {kind === "video" ? (
          <video
            src={src}
            controls
            preload="metadata"
            width={w}
            height={h}
            onLoadedMetadata={done}
            onError={done}
            className={mediaClass}
          />
        ) : (
          <Image
            src={src}
            alt={alt ?? ""}
            width={w}
            height={h}
            sizes="(max-width: 768px) 100vw, 800px"
            loading="lazy"
            onLoad={done}
            onError={done}
            className={mediaClass}
          />
        )}
      </span>
    </span>
  );
};

MarkdownMedia.displayName = "MarkdownMedia";

const isVideoUrl = (src: string) => {
  try {
    const pathname = new URL(src).pathname;
    return /\.(mp4|webm|ogg|mov)$/i.test(pathname);
  } catch {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src);
  }
};
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
    <blockquote className="rounded-sm border-l-6 border-amber-400 pl-4 italic text-gray-700 bg-amber-100 py-2 mb-6">
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

  img: ({ src, alt, width, height }) => (
    <MarkdownMedia
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      kind={typeof src === "string" && isVideoUrl(src) ? "video" : "image"}
    />
  ),

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
    <td className="px-4 py-2 text-black border border-gray-300">
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
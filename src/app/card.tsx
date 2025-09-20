"use client"; // for Next.js App Router

import { useEffect, useState } from "react";

interface Repo {
  name: string;
  description: string;
  url: string;
}

export  function RepoGrid() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: fetching your GitHub repos via GitHub API
    fetch("/api/getpage")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((repo: any) => ({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
        }));
        setRepos(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {repos.map((repo) => (
        <div
          key={repo.url}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
        >
          <h2 className="text-xl font-bold mb-2">{repo.name}</h2>
          <p className="text-gray-700 mb-4">
            {repo.description || "No description available."}
          </p>
          <a
            href={repo.url}
            target="_blank"
            className="text-blue-600 hover:underline font-medium"
          >
            View Repo
          </a>
        </div>
      ))}
    </div>
  );
}

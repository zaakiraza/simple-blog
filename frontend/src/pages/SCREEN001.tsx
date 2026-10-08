import { useCallback, useEffect, useState } from "react";
import { posts_list } from "../api";
import { CatalogGrid, EmptyState, ErrorMessage, LoadingSpinner } from "../components/Shared";
import { PostCard, toPostRow, type PostRow } from "../components/SCREEN001/PostCard";

export function SCREEN001() {
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setPosts(null);
    try {
      const result = await posts_list();
      const rows = (Array.isArray(result) ? result : [])
        .map(toPostRow)
        .filter((row): row is PostRow => row !== null)
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      setPosts(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load posts.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Posts</h1>
        <p className="text-sm text-slate-500">All posts, newest first.</p>
      </div>

      {error !== null ? (
        <div className="flex flex-col items-start gap-3">
          <ErrorMessage>Could not load posts.</ErrorMessage>
          <button
            type="button"
            onClick={() => {
              void load();
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            Retry
          </button>
        </div>
      ) : posts === null ? (
        <div className="flex items-center gap-3 text-sm text-slate-500" role="status">
          <LoadingSpinner />
          <span>Loading posts…</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <EmptyState>No posts yet</EmptyState>
        </div>
      ) : (
        <CatalogGrid>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </CatalogGrid>
      )}
    </main>
  );
}

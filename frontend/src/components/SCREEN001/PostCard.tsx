import { Link } from "react-router-dom";
import { Card } from "../Shared";

/** A normalized post row for the listing screen. */
export interface PostRow {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  authorUsername: string | null;
  createdAt: string | null;
  averageRating: number | null;
  ratingCount: number;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Defensive mapper for the `posts_list` rows (typed as unknown[] in the contract). */
export function toPostRow(item: unknown): PostRow | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const id = text(row.id);
  const title = text(row.title);
  if (!id || !title) return null;
  const body = text(row.body) ?? "";
  const explicit = text(row.excerpt);
  const excerpt =
    explicit ?? (body.length > 180 ? `${body.slice(0, 180).trimEnd()}…` : body);
  return {
    id,
    title,
    excerpt,
    coverImageUrl: text(row.coverImageUrl),
    authorUsername: text(row.authorUsername),
    createdAt: text(row.createdAt),
    averageRating: num(row.averageRating),
    ratingCount: num(row.ratingCount) ?? 0,
  };
}

export function formatPostDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Stars({ average }: { average: number }) {
  const filled = Math.min(5, Math.max(0, Math.round(average)));
  return (
    <span className="text-sm tracking-wide text-amber-500" aria-hidden="true">
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
}

function RatingSummary({ post }: { post: PostRow }) {
  if (post.averageRating === null) {
    return <span className="text-xs text-slate-400">No reviews yet</span>;
  }
  return (
    <span className="flex items-center gap-2">
      <Stars average={post.averageRating} />
      <span className="text-sm font-medium text-slate-700">{post.averageRating.toFixed(1)}</span>
      <span className="text-xs text-slate-500">
        {post.ratingCount === 1 ? "1 review" : `${post.ratingCount} reviews`}
      </span>
    </span>
  );
}

export function PostCard({ post }: { post: PostRow }) {
  const created = formatPostDate(post.createdAt);
  return (
    <Card className="h-full overflow-hidden p-0">
      <Link
        to={`/posts/${post.id}`}
        className="group flex h-full flex-col rounded-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
      >
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt="" loading="lazy" className="h-44 w-full object-cover" />
        ) : null}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
          <p className="text-sm leading-6 text-slate-600">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {post.authorUsername ? <span>By {post.authorUsername}</span> : null}
            {created ? <span>{created}</span> : null}
          </div>
          <div className="mt-auto pt-2">
            <RatingSummary post={post} />
          </div>
          <span className="pt-1 text-sm font-medium text-emerald-700 group-hover:underline">
            Read post →
          </span>
        </div>
      </Link>
    </Card>
  );
}

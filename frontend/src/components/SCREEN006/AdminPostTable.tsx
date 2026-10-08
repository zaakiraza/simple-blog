import { Link } from "react-router-dom";
import type { ComponentPropsWithoutRef } from "react";

/** One row of admin_posts_list, coerced from the contract's unknown items. */
export interface AdminPostRow {
  id: string;
  title: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  ratingCount: number;
  coverImageUrl?: string;
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

/** Read a list item defensively; the generated response type is unknown[]. */
export function toAdminPostRow(item: unknown): AdminPostRow {
  const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const parsed = Number(row.ratingCount);
  const cover = text(row.coverImageUrl);
  return {
    id: text(row.id),
    title: text(row.title) || "Untitled post",
    authorUsername: text(row.authorUsername),
    createdAt: text(row.createdAt),
    updatedAt: text(row.updatedAt),
    ratingCount: Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0,
    coverImageUrl: cover || undefined,
  };
}

/** ISO date → "Oct 8, 2026"; falls back to the raw value, or a dash when empty. */
export function formatPostDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const HEAD_L =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";
const HEAD_R =
  "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";

const EDIT_BUTTON =
  "inline-flex h-8 items-center rounded-md border border-[var(--line)] px-3 text-sm font-medium " +
  "hover:bg-[rgba(15,110,86,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

const DELETE_BUTTON =
  "inline-flex h-8 items-center rounded-md border border-[var(--line)] px-3 text-sm font-medium text-[var(--bad)] " +
  "hover:bg-[rgba(180,35,24,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bad)]";

interface AdminPostTableProps extends ComponentPropsWithoutRef<"table"> {
  items: AdminPostRow[];
  onDelete: (row: AdminPostRow) => void;
}

/** Management table for /admin/posts: title, author, timestamps, rating count, Edit + Delete per row. */
export function AdminPostTable({ items, onDelete, className, ...rest }: AdminPostTableProps) {
  return (
    <table {...rest} className={"w-full border-collapse text-left text-sm " + (className ?? "")}>
      <thead>
        <tr className="border-b border-[var(--line)] bg-[rgba(127,127,127,0.06)]">
          <th scope="col" className={HEAD_L}>
            Title
          </th>
          <th scope="col" className={HEAD_L}>
            Author
          </th>
          <th scope="col" className={HEAD_L + " whitespace-nowrap"}>
            Created
          </th>
          <th scope="col" className={HEAD_L + " whitespace-nowrap"}>
            Updated
          </th>
          <th scope="col" className={HEAD_R}>
            Ratings
          </th>
          <th scope="col" className={HEAD_R}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((row, index) => (
          <tr
            key={row.id || `row-${index}`}
            className="border-b border-[var(--line)] last:border-b-0 hover:bg-[rgba(127,127,127,0.06)]"
          >
            <th scope="row" className="px-4 py-3 align-top font-medium">
              <div className="flex items-center gap-3">
                {row.coverImageUrl ? (
                  <img
                    src={row.coverImageUrl}
                    alt=""
                    loading="lazy"
                    className="h-10 w-14 shrink-0 rounded border border-[var(--line)] object-cover"
                  />
                ) : null}
                <span className="min-w-0 break-words">{row.title}</span>
              </div>
            </th>
            <td className="px-4 py-3 align-top text-[var(--muted)]">{row.authorUsername || "—"}</td>
            <td className="whitespace-nowrap px-4 py-3 align-top text-[var(--muted)]">
              {formatPostDate(row.createdAt)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 align-top text-[var(--muted)]">
              {formatPostDate(row.updatedAt)}
            </td>
            <td className="px-4 py-3 text-right align-top tabular-nums">{row.ratingCount}</td>
            <td className="px-4 py-3 align-top">
              <div className="flex items-center justify-end gap-2">
                <Link to={`/admin/posts/${row.id}/edit`} className={EDIT_BUTTON}>
                  Edit
                </Link>
                <button type="button" className={DELETE_BUTTON} onClick={() => onDelete(row)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Table-shaped skeleton shown while admin_posts_list is pending. */
export function AdminPostTableSkeleton({ rows = 5 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-[rgba(127,127,127,0.2)]";
  return (
    <table className="w-full border-collapse text-left text-sm" aria-hidden="true">
      <thead>
        <tr className="border-b border-[var(--line)] bg-[rgba(127,127,127,0.06)]">
          <th scope="col" className={HEAD_L}>
            Title
          </th>
          <th scope="col" className={HEAD_L}>
            Author
          </th>
          <th scope="col" className={HEAD_L + " whitespace-nowrap"}>
            Created
          </th>
          <th scope="col" className={HEAD_L + " whitespace-nowrap"}>
            Updated
          </th>
          <th scope="col" className={HEAD_R}>
            Ratings
          </th>
          <th scope="col" className={HEAD_R}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index} className="border-b border-[var(--line)] last:border-b-0">
            <td className="px-4 py-3">
              <div className={`h-4 w-40 ${bar}`} />
            </td>
            <td className="px-4 py-3">
              <div className={`h-4 w-24 ${bar}`} />
            </td>
            <td className="px-4 py-3">
              <div className={`h-4 w-20 ${bar}`} />
            </td>
            <td className="px-4 py-3">
              <div className={`h-4 w-20 ${bar}`} />
            </td>
            <td className="px-4 py-3">
              <div className={`ml-auto h-4 w-8 ${bar}`} />
            </td>
            <td className="px-4 py-3">
              <div className={`ml-auto h-8 w-32 ${bar}`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

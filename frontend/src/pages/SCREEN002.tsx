import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  post_ratings_list,
  posts_get,
  ratings_delete,
  ratings_update,
  ratings_upsert,
} from "../api";
import { ApiError, getAuthSession, getAuthToken } from "../http";
import { LOGIN_ROUTE } from "../auth";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

interface PostDetail {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  coverImageUrl: string | null;
  authorUsername: string | null;
  createdAt: string | null;
  averageRating: number | null;
  ratingCount: number;
}

interface RatingRow {
  id: string;
  userId: string | null;
  author: string | null;
  stars: number;
  comment: string;
  createdAt: string | null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toPostDetail(item: unknown): PostDetail | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const id = text(row.id);
  const title = text(row.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    body: text(row.body) ?? "",
    excerpt: text(row.excerpt) ?? "",
    coverImageUrl: text(row.coverImageUrl),
    authorUsername: text(row.authorUsername),
    createdAt: text(row.createdAt),
    averageRating: num(row.averageRating),
    ratingCount: num(row.ratingCount) ?? 0,
  };
}

/** Defensive mapper for the `post_ratings_list` rows (typed as unknown[] in the contract). */
function toRatingRow(item: unknown): RatingRow | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const id = text(row.id);
  const stars = num(row.stars);
  if (!id || stars === null) return null;
  const user = row.user && typeof row.user === "object" ? (row.user as Record<string, unknown>) : undefined;
  return {
    id,
    userId: text(row.userId) ?? (user ? text(user.id) : null),
    author: user ? text(user.username) : null,
    stars: Math.min(5, Math.max(1, Math.round(stars))),
    comment: text(row.comment) ?? "",
    createdAt: text(row.createdAt),
  };
}

/** The signed-in user's id (stored with the session at login) — used to spot the user's own rating. */
function currentUserId(): string | null {
  const session = getAuthSession();
  if (!session || typeof session !== "object") return null;
  const row = session as Record<string, unknown>;
  const user = row.user && typeof row.user === "object" ? (row.user as Record<string, unknown>) : row;
  return text(user.id);
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function StarsRow({ stars }: { stars: number }) {
  const filled = Math.min(5, Math.max(0, stars));
  return (
    <span className="text-sm tracking-wide text-amber-500" aria-hidden="true">
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
}

const INPUT_CLASS =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";

const GHOST_BUTTON =
  "inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 " +
  "hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700";

/** Post Detail (/posts/:id): the post, its ratings, and rating create / edit / delete. */
export function SCREEN002() {
  const { id = "" } = useParams();
  const signedIn = Boolean(getAuthToken());
  const me = currentUserId();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStars, setEditStars] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRatings = useCallback(async () => {
    if (!id) return;
    setRatingsError(null);
    try {
      const result = await post_ratings_list(id);
      setRatings(
        (Array.isArray(result) ? result : [])
          .map(toRatingRow)
          .filter((row): row is RatingRow => row !== null),
      );
    } catch (err) {
      setRatings([]);
      setRatingsError(err instanceof Error ? err.message : "Could not load ratings.");
    }
  }, [id]);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("This post does not exist.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = toPostDetail(await posts_get(id));
      if (!detail) throw new ApiError(0, "This post does not exist.");
      setPost(detail);
    } catch (err) {
      setPost(null);
      setError(err instanceof Error ? err.message : "Could not load this post.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    void loadRatings();
  }, [load, loadRatings]);

  async function submitRating(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || submitting) return;
    setFormError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await ratings_upsert({ postId: id, stars, comment: comment.trim() ? comment.trim() : undefined });
      setComment("");
      setNotice("Thanks — your rating was saved.");
      await loadRatings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save your rating. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(rating: RatingRow) {
    setNotice(null);
    setEditError(null);
    setEditingId(rating.id);
    setEditStars(rating.stars);
    setEditComment(rating.comment);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || editBusy) return;
    setEditBusy(true);
    setEditError(null);
    try {
      await ratings_update(editingId, { stars: editStars, comment: editComment.trim() ? editComment.trim() : undefined });
      setEditingId(null);
      setNotice("Your rating was updated.");
      await loadRatings();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not update your rating. Try again.");
    } finally {
      setEditBusy(false);
    }
  }

  async function removeRating(ratingId: string) {
    if (deletingId) return;
    setDeletingId(ratingId);
    setEditError(null);
    setNotice(null);
    try {
      await ratings_delete(ratingId);
      setEditingId(null);
      setNotice("Your rating was removed.");
      await loadRatings();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not remove your rating. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3 text-sm text-slate-500" role="status">
          <LoadingSpinner />
          <span>Loading post…</span>
        </div>
      </main>
    );
  }

  if (error !== null || post === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Card className="flex flex-col items-start gap-3">
          <ErrorMessage>{error ?? "This post does not exist."}</ErrorMessage>
          <div className="flex items-center gap-3">
            <button type="button" className={GHOST_BUTTON} onClick={() => void load()}>
              Retry
            </button>
            <Link to="/" className="text-sm font-medium text-emerald-700 hover:underline">
              ← Back to posts
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const created = formatDate(post.createdAt);
  const average = post.averageRating;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Back to posts
      </Link>

      <article className="card mt-4 overflow-hidden p-0">
        {post.coverImageUrl ? <img src={post.coverImageUrl} alt="" className="h-64 w-full object-cover" /> : null}
        <div className="flex flex-col gap-3 p-6">
          <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {post.authorUsername ? <span>By {post.authorUsername}</span> : null}
            {created ? <span>{created}</span> : null}
            {average !== null ? (
              <span className="flex items-center gap-2">
                <StarsRow stars={Math.round(average)} />
                <span className="font-medium text-slate-700">{average.toFixed(1)}</span>
                <span>{post.ratingCount === 1 ? "1 review" : `${post.ratingCount} reviews`}</span>
              </span>
            ) : null}
          </div>
          {post.excerpt ? <p className="text-base font-medium text-slate-600">{post.excerpt}</p> : null}
          {post.body
            .split(/\n{2,}/)
            .filter((paragraph) => paragraph.trim())
            .map((paragraph, index) => (
              <p key={index} className="text-base leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
        </div>
      </article>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Ratings &amp; reviews</h2>
        <p className="mt-1 text-sm text-slate-500">
          {ratings.length === 0 ? "No reviews yet — be the first to rate this post." : `${ratings.length} ${ratings.length === 1 ? "review" : "reviews"}`}
        </p>

        {ratingsError ? (
          <div className="mt-3 flex items-center gap-3">
            <ErrorMessage>{ratingsError}</ErrorMessage>
            <button type="button" className={GHOST_BUTTON} onClick={() => void loadRatings()}>
              Retry
            </button>
          </div>
        ) : null}

        <ul className="mt-4 flex flex-col gap-3">
          {ratings.map((rating) => {
            const own = me !== null && rating.userId !== null && rating.userId === me;
            if (own && editingId === rating.id) {
              return (
                <li key={rating.id} className="card">
                  <form className="flex flex-col gap-3" onSubmit={(event) => void saveEdit(event)} noValidate>
                    <div>
                      <label htmlFor="edit-stars" className="block text-sm font-medium text-slate-700">
                        Stars
                      </label>
                      <select
                        id="edit-stars"
                        value={editStars}
                        onChange={(event) => setEditStars(Number(event.target.value))}
                        className={INPUT_CLASS}
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} {value === 1 ? "star" : "stars"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-comment" className="block text-sm font-medium text-slate-700">
                        Comment
                      </label>
                      <textarea
                        id="edit-comment"
                        rows={3}
                        value={editComment}
                        onChange={(event) => setEditComment(event.target.value)}
                        className={INPUT_CLASS}
                        placeholder="What did you think?"
                      />
                    </div>
                    {editError ? <ErrorMessage>{editError}</ErrorMessage> : null}
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={editBusy}
                        className="inline-flex h-9 items-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {editBusy ? <LoadingSpinner /> : null}
                        Save
                      </button>
                      <button
                        type="button"
                        className={GHOST_BUTTON}
                        onClick={() => setEditingId(null)}
                        disabled={editBusy}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </li>
              );
            }
            return (
              <li key={rating.id} className="card flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarsRow stars={rating.stars} />
                  <span className="text-sm font-medium text-slate-700">{rating.author ?? "Reader"}</span>
                  {formatDate(rating.createdAt) ? (
                    <span className="text-xs text-slate-500">{formatDate(rating.createdAt)}</span>
                  ) : null}
                  {own ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Your review
                    </span>
                  ) : null}
                </div>
                {rating.comment ? <p className="text-sm leading-6 text-slate-600">{rating.comment}</p> : null}
                {own ? (
                  <div className="mt-1 flex items-center gap-2">
                    <button type="button" className={GHOST_BUTTON} onClick={() => startEdit(rating)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center rounded-md border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      onClick={() => void removeRating(rating.id)}
                      disabled={deletingId !== null}
                    >
                      {deletingId === rating.id ? <LoadingSpinner /> : null}
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Rate this post</h2>
        {signedIn ? (
          <Card className="mt-3">
            <form className="flex flex-col gap-4" onSubmit={submitRating} noValidate>
              <div>
                <label htmlFor="rating-stars" className="block text-sm font-medium text-slate-700">
                  Stars
                </label>
                <select
                  id="rating-stars"
                  value={stars}
                  onChange={(event) => setStars(Number(event.target.value))}
                  className={INPUT_CLASS}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rating-comment" className="block text-sm font-medium text-slate-700">
                  Comment (optional)
                </label>
                <textarea
                  id="rating-comment"
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="What did you think?"
                />
              </div>
              {formError ? <ErrorMessage>{formError}</ErrorMessage> : null}
              {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <LoadingSpinner /> : null}
                Save rating
              </button>
            </form>
          </Card>
        ) : (
          <p className="muted mt-3 text-sm">
            <Link to={LOGIN_ROUTE} className="font-medium text-emerald-700 hover:underline">
              Sign in
            </Link>{" "}
            to rate this post.
          </p>
        )}
      </section>

      {ratings.length === 0 && ratingsError === null ? (
        <div className="mt-6">
          <EmptyState>No reviews yet.</EmptyState>
        </div>
      ) : null}
    </main>
  );
}

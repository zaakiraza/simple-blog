import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { posts_create, posts_get, posts_update } from "../api";
import { Card, ErrorMessage, LoadingSpinner } from "../components/Shared";

const ADMIN_POSTS_ROUTE = "/admin/posts";

const INPUT_CLASS =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";

const PRIMARY_BUTTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white " +
  "hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

interface EditorFields {
  title: string;
  excerpt: string;
  coverImageUrl: string;
  body: string;
}

const EMPTY_FIELDS: EditorFields = { title: "", excerpt: "", coverImageUrl: "", body: "" };

/** Admin Post Editor: create at /admin/posts/new, edit at /admin/posts/:id/edit. */
export function SCREEN005() {
  const navigate = useNavigate();
  const params = useParams();
  const routeId = text(params.id);
  const editingPostId = routeId !== null && routeId !== "new" ? routeId : null;

  const [fields, setFields] = useState<EditorFields>(EMPTY_FIELDS);
  const [loadingPost, setLoadingPost] = useState(editingPostId !== null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; body?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadPost = useCallback(async () => {
    if (!editingPostId) {
      setFields(EMPTY_FIELDS);
      setLoadingPost(false);
      setLoadError(null);
      return;
    }
    setLoadingPost(true);
    setLoadError(null);
    try {
      const post = await posts_get(editingPostId);
      const row =
        post && typeof post === "object" ? (post as unknown as Record<string, unknown>) : {};
      setFields({
        title: text(row.title) ?? "",
        excerpt: text(row.excerpt) ?? "",
        coverImageUrl: text(row.coverImageUrl) ?? "",
        body: text(row.body) ?? "",
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load this post.");
    } finally {
      setLoadingPost(false);
    }
  }, [editingPostId]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    const next: typeof fieldErrors = {};
    if (!fields.title.trim()) next.title = "Title is required";
    if (!fields.body.trim()) next.body = "Body is required";
    setFieldErrors(next);
    if (next.title || next.body) return;

    const payload: { title: string; body: string; excerpt?: string; coverImageUrl?: string } = {
      title: fields.title.trim(),
      body: fields.body.trim(),
    };
    const excerpt = fields.excerpt.trim();
    if (excerpt) payload.excerpt = excerpt;
    const coverImageUrl = fields.coverImageUrl.trim();
    if (coverImageUrl) payload.coverImageUrl = coverImageUrl;

    setPending(true);
    try {
      if (editingPostId) {
        await posts_update(editingPostId, payload);
      } else {
        await posts_create(payload);
      }
      navigate(ADMIN_POSTS_ROUTE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the post. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (loadingPost) {
    return (
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 text-sm text-slate-500" role="status">
            <LoadingSpinner />
            <span>Loading post…</span>
          </div>
        </div>
      </main>
    );
  }

  if (loadError !== null) {
    return (
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Card className="flex flex-col items-start gap-3">
            <ErrorMessage>{loadError}</ErrorMessage>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadPost()}
                className="inline-flex h-9 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Retry
              </button>
              <Link to={ADMIN_POSTS_ROUTE} className="text-sm font-medium text-emerald-700 hover:underline">
                ← Back to posts
              </Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{editingPostId ? "Edit post" : "New post"}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {editingPostId ? "Update the post and save your changes." : "Write a new post and publish it to the blog."}
          </p>
        </div>

        <Card>
          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="post-title"
                name="title"
                type="text"
                value={fields.title}
                onChange={(event) => setFields((current) => ({ ...current, title: event.target.value }))}
                aria-invalid={fieldErrors.title ? true : undefined}
                aria-describedby={fieldErrors.title ? "post-title-error" : undefined}
                className={INPUT_CLASS}
                placeholder="An interesting title"
              />
              {fieldErrors.title ? (
                <p id="post-title-error" className="error mt-1 text-sm">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="post-excerpt" className="block text-sm font-medium text-slate-700">
                Excerpt (optional)
              </label>
              <input
                id="post-excerpt"
                name="excerpt"
                type="text"
                value={fields.excerpt}
                onChange={(event) => setFields((current) => ({ ...current, excerpt: event.target.value }))}
                className={INPUT_CLASS}
                placeholder="A short teaser shown on the listing"
              />
            </div>

            <div>
              <label htmlFor="post-cover" className="block text-sm font-medium text-slate-700">
                Cover image URL (optional)
              </label>
              <input
                id="post-cover"
                name="coverImageUrl"
                type="url"
                value={fields.coverImageUrl}
                onChange={(event) => setFields((current) => ({ ...current, coverImageUrl: event.target.value }))}
                className={INPUT_CLASS}
                placeholder="https://…"
              />
            </div>

            <div>
              <label htmlFor="post-body" className="block text-sm font-medium text-slate-700">
                Body
              </label>
              <textarea
                id="post-body"
                name="body"
                rows={10}
                value={fields.body}
                onChange={(event) => setFields((current) => ({ ...current, body: event.target.value }))}
                aria-invalid={fieldErrors.body ? true : undefined}
                aria-describedby={fieldErrors.body ? "post-body-error" : undefined}
                className={INPUT_CLASS}
                placeholder="Write the post…"
              />
              {fieldErrors.body ? (
                <p id="post-body-error" className="error mt-1 text-sm">
                  {fieldErrors.body}
                </p>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <ErrorMessage>{error}</ErrorMessage>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
                {pending ? <LoadingSpinner /> : null}
                {editingPostId ? "Save changes" : "Create post"}
              </button>
              <Link
                to={ADMIN_POSTS_ROUTE}
                className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                Cancel
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

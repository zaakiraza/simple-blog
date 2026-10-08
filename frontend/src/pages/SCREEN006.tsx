import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { admin_posts_list, posts_delete } from "../api";
import { ApiError } from "../http";
import { Card, EmptyState, ErrorMessage, LoadingSpinner } from "../components/Shared";
import {
  AdminPostTable,
  AdminPostTableSkeleton,
  toAdminPostRow,
  type AdminPostRow,
} from "../components/SCREEN006/AdminPostTable";
import { ConfirmDeletePostDialog } from "../components/SCREEN006/ConfirmDeletePostDialog";

const NEW_POST_ROUTE = "/admin/posts/new";

const PRIMARY_BUTTON =
  "inline-flex h-9 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white " +
  "hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

const GHOST_BUTTON =
  "inline-flex h-9 items-center rounded-md border border-[var(--line)] px-4 text-sm font-medium " +
  "hover:bg-[rgba(15,110,86,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

function deleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "Admin access required";
    if (error.status === 404) return "Post not found";
    return error.message;
  }
  return error instanceof Error ? error.message : "Could not delete the post. Try again.";
}

/** Admin Post List (/admin/posts): manage all posts with edit and delete entry points. */
export function SCREEN006() {
  const [rows, setRows] = useState<AdminPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminPostRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await admin_posts_list();
      setRows(Array.isArray(result) ? result.map(toAdminPostRow) : []);
    } catch (cause) {
      setRows([]);
      setError(
        cause instanceof ApiError
          ? cause
          : new ApiError(0, cause instanceof Error ? cause.message : "Could not load posts. Retry."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const askDelete = (row: AdminPostRow) => {
    setDeleteError(null);
    setPendingDelete(row);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    if (!target || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await posts_delete(target.id);
      setPendingDelete(null);
      setRows((current) => current.filter((row) => row.id !== target.id));
      await load();
    } catch (cause) {
      setDeleteError(deleteErrorMessage(cause));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Posts</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {loading || error
                ? "Manage every post: edit it, or delete it with all its ratings."
                : `${rows.length} ${rows.length === 1 ? "post" : "posts"} — edit or delete any of them.`}
            </p>
          </div>
          <Link to={NEW_POST_ROUTE} className={PRIMARY_BUTTON}>
            New post
          </Link>
        </div>

        {loading ? (
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
              <LoadingSpinner />
              <span className="text-sm text-[var(--muted)]">Loading posts…</span>
            </div>
            <AdminPostTableSkeleton />
          </Card>
        ) : error ? (
          <Card className="mb-6">
            <ErrorMessage>
              {error.status === 403 ? "Admin access required" : "Could not load posts. Retry."}
            </ErrorMessage>
            {error.status !== 403 && error.message ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{error.message}</p>
            ) : null}
            <div className="mt-3">
              <button type="button" className={GHOST_BUTTON} onClick={() => void load()}>
                Retry
              </button>
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <EmptyState>No posts yet — create your first post</EmptyState>
            <Link to={NEW_POST_ROUTE} className={PRIMARY_BUTTON}>
              New post
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <AdminPostTable items={rows} onDelete={askDelete} />
            </div>
          </Card>
        )}

        {pendingDelete ? (
          <ConfirmDeletePostDialog
            post={pendingDelete}
            busy={deleting}
            error={deleteError}
            onCancel={cancelDelete}
            onConfirm={() => void confirmDelete()}
          />
        ) : null}
      </div>
    </main>
  );
}

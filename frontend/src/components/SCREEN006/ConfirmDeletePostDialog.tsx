import { useEffect, useRef } from "react";
import { ErrorMessage, LoadingSpinner } from "../Shared";
import type { AdminPostRow } from "./AdminPostTable";

interface ConfirmDeletePostDialogProps {
  post: AdminPostRow;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmation for posts_delete: states the cascade and cannot be dismissed while pending. */
export function ConfirmDeletePostDialog({
  post,
  busy = false,
  error = null,
  onCancel,
  onConfirm,
}: ConfirmDeletePostDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, [post.id]);

  useEffect(() => {
    if (busy) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const cancelButton =
    "inline-flex h-10 items-center rounded-md border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-medium " +
    "hover:bg-[rgba(127,127,127,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
  const deleteButton =
    "inline-flex h-10 items-center gap-2 rounded-md bg-[var(--bad)] px-4 text-sm font-medium text-white " +
    "hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bad)] focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(21,32,43,0.45)] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-dialog-title"
        aria-describedby="delete-post-dialog-message"
        className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--card)] p-6 shadow-lg"
      >
        <h2 id="delete-post-dialog-title" className="text-lg font-semibold">
          Delete &quot;{post.title}&quot;?
        </h2>
        <p id="delete-post-dialog-message" className="mt-2 text-sm text-[var(--muted)]">
          This permanently deletes the post together with all its ratings and reviews. This cannot be undone.
        </p>
        {error ? (
          <div className="mt-3">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <button ref={cancelRef} type="button" className={cancelButton} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={deleteButton} onClick={onConfirm} disabled={busy}>
            {busy ? (
              <>
                <LoadingSpinner />
                Deleting…
              </>
            ) : (
              "Delete post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

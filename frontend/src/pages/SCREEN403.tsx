import { LoadingSpinner, EmptyState } from "../components/Shared";

/** Stub for Forbidden (/403) — builder fills this screen. */
export function SCREEN403() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Forbidden</h1>
      <LoadingSpinner />
      <EmptyState>Loading Forbidden…</EmptyState>
    </main>
  );
}

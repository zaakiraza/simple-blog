import { Card } from "../components/Shared";

/** Offline (/offline) — network unavailable chrome page. Static; no API calls. */
export function SCREENOFFLINE() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-lg">
        <Card className="p-8 text-center">
          <p className="text-6xl font-bold text-[#0f6e56]" aria-hidden="true">
            ⚡
          </p>
          <h1 className="mt-4 text-2xl font-semibold">You're offline</h1>
          <p className="mt-2 text-[#5b6b7c]">
            You appear to be offline. Check your connection and try again.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-block rounded-md bg-[#0f6e56] px-4 py-2 font-medium text-white hover:bg-[#0b5342] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6e56] focus-visible:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}

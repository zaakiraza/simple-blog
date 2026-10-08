import { Link } from "react-router-dom";
import { Card } from "../components/Shared";

/** Not Found (/404) — unknown route or nonexistent post. */
export function SCREEN404() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-lg">
        <Card className="p-8 text-center">
          <p className="text-6xl font-bold text-[#0f6e56]">404</p>
          <h1 className="mt-4 text-2xl font-semibold">Post not found</h1>
          <p className="mt-2 text-[#5b6b7c]">
            The post you are looking for does not exist or may have been removed.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-block rounded-md bg-[#0f6e56] px-4 py-2 font-medium text-white hover:bg-[#0b5342] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6e56] focus-visible:ring-offset-2"
            >
              Go home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

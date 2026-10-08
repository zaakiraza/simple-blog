import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth_login } from "../api";
import { ApiError } from "../http";
import { ErrorMessage, LoadingSpinner } from "../components/Shared";
import { AuthFormCard } from "../components/SCREEN004/AuthFormCard";

const WRONG_CREDENTIALS = "Email/username or password is incorrect";

/** Login (/login): sign in with email or username; on success the header shows the username. */
export function SCREEN004() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const next: typeof fieldErrors = {};
    if (!identifier.trim()) next.identifier = "Email or username is required";
    if (!password) next.password = "Password is required";
    setFieldErrors(next);
    if (next.identifier || next.password) return;
    setPending(true);
    try {
      // The generated client stores the token; the shell reads the session for the header name.
      await auth_login({ identifier: identifier.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? WRONG_CREDENTIALS : err instanceof Error ? err.message : WRONG_CREDENTIALS);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-[78vh] items-center justify-center px-4 py-12">
      <AuthFormCard title="Log in">
        <p className="mt-1 text-sm text-slate-500">Sign in with your email or username.</p>
        <form id="login-form" className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
              Email or username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              aria-invalid={fieldErrors.identifier ? true : undefined}
              aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              placeholder="you@example.com"
            />
            {fieldErrors.identifier ? (
              <p id="identifier-error" className="error mt-1 text-sm">
                {fieldErrors.identifier}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-16 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label="Show or hide"
                aria-pressed={show}
                onClick={() => setShow((value) => !value)}
                className="absolute inset-y-0 right-0 my-1 mr-1 inline-flex items-center rounded px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password ? (
              <p id="password-error" className="error mt-1 text-sm">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <ErrorMessage>{error}</ErrorMessage>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <LoadingSpinner /> : null}
            Log in
          </button>
        </form>
      </AuthFormCard>
    </main>
  );
}

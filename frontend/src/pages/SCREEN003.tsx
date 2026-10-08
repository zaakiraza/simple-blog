import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth_signup } from "../api";
import { ApiError } from "../http";
import { Card, ErrorMessage, LoadingSpinner } from "../components/Shared";

/** Signup (/signup) — create a reader account and auto sign-in. */

type FieldName = "email" | "username" | "password";

type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LABELS: Record<FieldName, string> = {
  email: "Email",
  username: "Username",
  password: "Password",
};

function validate(values: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email";
  if (!values.username.trim()) errors.username = "Username is required";
  if (!values.password) errors.password = "Password is required";
  return errors;
}

function Input({
  id,
  invalid,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={
        "block w-full rounded-md border bg-white px-3 py-2 text-sm text-[var(--ink)] shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 " +
        (invalid
          ? "border-[var(--bad)] focus:border-[var(--bad)] "
          : "border-[var(--line)] focus:border-[var(--accent)] ") +
        className
      }
      {...rest}
    />
  );
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: FieldName;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`signup-${name}`} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      <div id={`signup-${name}-error`} className="min-h-5">
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    </div>
  );
}

export function SCREEN003() {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<FieldName, string>>({
    email: "",
    username: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  function setField(name: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function applyServerError(error: ApiError) {
    const message = error.message || "Could not create the account";
    const field: FieldName | undefined = /user\s*name/i.test(message)
      ? "username"
      : /e-?mail/i.test(message)
        ? "email"
        : /pass\s*word/i.test(message)
          ? "password"
          : undefined;
    if (error.status === 409) {
      const next: FieldErrors = {};
      next[field === "username" ? "username" : "email"] = /user\s*name/i.test(message)
        ? "That username is taken"
        : "An account with this email already exists";
      setFieldErrors(next);
      setFormError(undefined);
      return;
    }
    if (field) {
      const next: FieldErrors = {};
      next[field] = message;
      setFieldErrors(next);
      setFormError(undefined);
      return;
    }
    setFormError(message);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setPending(true);
    try {
      await auth_signup({
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
      });
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) applyServerError(error);
      else setFormError(error instanceof Error ? error.message : String(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <p className="muted mt-1 text-sm">
          Create a reader account to rate and review posts.
        </p>

        <form id="signup-form" className="mt-6 space-y-2" onSubmit={handleSubmit} noValidate>
          <Field name="email" label="Email" error={fieldErrors.email}>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              invalid={Boolean(fieldErrors.email)}
              onChange={(event) => setField("email", event.target.value)}
            />
          </Field>

          <Field name="username" label="Username" error={fieldErrors.username}>
            <Input
              id="signup-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="bookworm"
              value={values.username}
              invalid={Boolean(fieldErrors.username)}
              onChange={(event) => setField("username", event.target.value)}
            />
          </Field>

          <Field name="password" label="Password" error={fieldErrors.password}>
            <div className="relative">
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="pr-10"
                value={values.password}
                invalid={Boolean(fieldErrors.password)}
                onChange={(event) => setField("password", event.target.value)}
              />
              <button
                type="button"
                aria-label="Show or hide"
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30"
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {formError ? <ErrorMessage>{formError}</ErrorMessage> : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <LoadingSpinner /> : null}
            Create account
          </button>
        </form>
      </Card>
    </main>
  );
}

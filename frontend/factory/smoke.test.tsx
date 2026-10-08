// Written by AI Factory for the Build App integration gate; do not edit. Renders the app at each
// route against the running backend and fails on runtime errors and on failed API requests.
// HTTP 403 is not a failure: the smoke token is a member, so admin and other role gates return 403.
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";

vi.hoisted(() => {
  const token = process.env.FACTORY_SMOKE_TOKEN;
  if (token) localStorage.setItem("ai-factory-auth-token", token);
});

import { App } from "../src/App";

const ROUTES: string[] = ["/","/signup","/login","/admin/posts","/403","/404","/offline"];
const failedRequests: string[] = [];
let inFlight = 0;
let lastActivity = Date.now();
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const url = input instanceof Request ? input.url : String(input);
  inFlight += 1;
  try {
    const res = await realFetch(input, init);
    // Prism (the contract mock, or the proxy in front of the real backend) reports what breaks
    // openapi.yaml in this header, on any status: request parts are the app's, response parts the API's.
    const violations = res.headers.get("sl-violations");
    const flagged = violations && /"severity":"Error"/.test(violations) ? ` · contract violations: ${violations.slice(0, 2_000)}` : "";
    if (res.status === 403) {
      console.warn(`${method} ${url} → HTTP 403 (member token; role-gated routes are not failures)`);
    } else if (res.status >= 400) {
      const body = await res.clone().text().catch(() => "");
      failedRequests.push(`${method} ${url} → HTTP ${res.status} ${body.slice(0, 240)}${flagged}`);
    } else if (flagged) {
      failedRequests.push(`${method} ${url} → HTTP ${res.status}${flagged}`);
    }
    return res;
  } catch (error) {
    failedRequests.push(`${method} ${url} → network error: ${String(error)}`);
    throw error;
  } finally {
    inFlight -= 1;
    lastActivity = Date.now();
  }
}) as typeof fetch;

afterEach(cleanup);

function isError(args: unknown[]): boolean {
  return args.some((arg) => arg instanceof Error) || /Error|Uncaught|above error/.test(args.map(String).join(" "));
}

/** Until no request has been in flight for 400ms (max 6s): pages load data in effects. */
async function settle(): Promise<void> {
  const deadline = Date.now() + 6_000;
  await new Promise((resolve) => setTimeout(resolve, 150));
  while (Date.now() < deadline && (inFlight > 0 || Date.now() - lastActivity < 400)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

it.each(ROUTES)("renders %s against the live API", async (route) => {
  failedRequests.length = 0;
  const errors: string[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    if (isError(args)) {
      errors.push(args.map((arg) => (arg instanceof Error ? arg.stack ?? arg.message : String(arg))).join(" "));
    }
  });
  const onError = (event: ErrorEvent) => {
    errors.push(String(event.error?.stack ?? event.message));
    event.preventDefault();
  };
  window.addEventListener("error", onError);
  try {
    const { container } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    );
    await settle();
    expect(failedRequests, `route ${route}: API requests failed:\n${failedRequests.join("\n")}`).toEqual([]);
    expect(errors, `route ${route} threw:\n${errors.join("\n")}`).toEqual([]);
    expect(container.innerHTML.length, `route ${route} rendered nothing`).toBeGreaterThan(0);
    expect(container.textContent ?? "", `route ${route} shows "VITE_API_URL is not set"`).not.toContain("VITE_API_URL is not set");
  } finally {
    spy.mockRestore();
    window.removeEventListener("error", onError);
  }
});

/** AUTO-GENERATED from openapi — do not edit. */
import { request, setAuthSession, setAuthToken } from "../http";
import type { AdminPostsListResponse, AuthLoginRequest, AuthLoginResponse, AuthSignupRequest, AuthSignupResponse, PostRatingsListResponse, PostsCreateRequest, PostsCreateResponse, PostsGetResponse, PostsListResponse, PostsUpdateRequest, PostsUpdateResponse, RatingsUpdateRequest, RatingsUpdateResponse, RatingsUpsertRequest, RatingsUpsertResponse } from "./types";

/** Pick the JWT from a login/register body (OpenAPI field names vary). */
function extractAccessToken(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const body = result as Record<string, unknown>;
  for (const key of ["accessToken", "token", "access_token", "sessionToken", "session_token"] as const) {
    const value = body[key];
    if (typeof value === "string" && value) return value;
  }
  return undefined;
}

export async function auth_signup(body: AuthSignupRequest): Promise<AuthSignupResponse> {
  const result = await request<AuthSignupResponse>("POST", "/auth/signup", body);
  const token = extractAccessToken(result);
  if (token) {
    setAuthToken(token);
    setAuthSession(result);
  }
  return result;
}

export async function auth_login(body: AuthLoginRequest): Promise<AuthLoginResponse> {
  const result = await request<AuthLoginResponse>("POST", "/auth/login", body);
  const token = extractAccessToken(result);
  if (token) {
    setAuthToken(token);
    setAuthSession(result);
  }
  return result;
}

export async function auth_logout(): Promise<void> {
  try {
    return await request<void>("POST", "/auth/logout");
  } finally {
    setAuthToken(undefined);
  }
}

export async function posts_list(): Promise<PostsListResponse> {
  return request<PostsListResponse>("GET", "/posts");
}

export async function posts_create(body: PostsCreateRequest): Promise<PostsCreateResponse> {
  return request<PostsCreateResponse>("POST", "/posts", body);
}

export async function posts_get(id: string): Promise<PostsGetResponse> {
  return request<PostsGetResponse>("GET", `/posts/${id}`);
}

export async function posts_update(id: string, body: PostsUpdateRequest): Promise<PostsUpdateResponse> {
  return request<PostsUpdateResponse>("PUT", `/posts/${id}`, body);
}

export async function posts_delete(id: string): Promise<void> {
  return request<void>("DELETE", `/posts/${id}`);
}

export async function admin_posts_list(): Promise<AdminPostsListResponse> {
  return request<AdminPostsListResponse>("GET", "/admin/posts");
}

export async function post_ratings_list(id: string): Promise<PostRatingsListResponse> {
  return request<PostRatingsListResponse>("GET", `/posts/${id}/ratings`);
}

export async function ratings_upsert(body: RatingsUpsertRequest): Promise<RatingsUpsertResponse> {
  return request<RatingsUpsertResponse>("POST", "/ratings", body);
}

export async function ratings_update(id: string, body: RatingsUpdateRequest): Promise<RatingsUpdateResponse> {
  return request<RatingsUpdateResponse>("PUT", `/ratings/${id}`, body);
}

export async function ratings_delete(id: string): Promise<void> {
  return request<void>("DELETE", `/ratings/${id}`);
}

export { setAuthToken };

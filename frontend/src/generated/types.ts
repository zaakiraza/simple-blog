/** AUTO-GENERATED from openapi — do not edit. */
export interface AuthSignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthSignupResponse {
  user: { id: string; email: string; username: string; role: "user" | "admin"; createdAt: string };
  session: { id: string; userId: string; createdAt: string };
  accessToken: string;
}

export interface AuthLoginRequest {
  identifier: string;
  password: string;
}

export interface AuthLoginResponse {
  user: { id: string; email: string; username: string; role: "user" | "admin"; createdAt: string };
  session: { id: string; userId: string; createdAt: string };
  accessToken: string;
}

export type PostsListResponse = unknown[];

export interface PostsCreateRequest {
  title: string;
  body: string;
  excerpt?: string;
  coverImageUrl?: string;
}

export interface PostsCreateResponse {
  id: string;
  title: string;
  body: string;
  excerpt?: unknown;
  coverImageUrl?: unknown;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsGetResponse {
  id: string;
  title: string;
  body: string;
  excerpt?: unknown;
  coverImageUrl?: unknown;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  averageRating?: unknown;
  ratingCount?: number;
  authorUsername?: string;
}

export interface PostsUpdateRequest {
  title: string;
  body: string;
  excerpt?: string;
  coverImageUrl?: string;
}

export interface PostsUpdateResponse {
  id: string;
  title: string;
  body: string;
  excerpt?: unknown;
  coverImageUrl?: unknown;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminPostsListResponse = unknown[];

export type PostRatingsListResponse = unknown[];

export interface RatingsUpsertRequest {
  postId: string;
  stars: number;
  comment?: string;
}

export interface RatingsUpsertResponse {
  id: string;
  postId: string;
  userId: string;
  stars: number;
  comment?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface RatingsUpdateRequest {
  stars: number;
  comment?: string;
}

export interface RatingsUpdateResponse {
  id: string;
  postId: string;
  userId: string;
  stars: number;
  comment?: unknown;
  createdAt: string;
  updatedAt: string;
}

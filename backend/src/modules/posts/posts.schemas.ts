import { z } from "zod";

// Mirrors the contract's PostInput (POST /posts, PUT /posts/{id}).
export const PostInputSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  body: z.string({ error: "Body is required" }).trim().min(1, "Body is required"),
  excerpt: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
});
export type PostInput = z.infer<typeof PostInputSchema>;

// Documented response shapes: exactly these fields, nothing internal.
export interface PostResponse {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithStatsResponse extends PostResponse {
  /** Mean star value, null when the post has no ratings yet. */
  averageRating: number | null;
  ratingCount: number;
  authorUsername: string;
}

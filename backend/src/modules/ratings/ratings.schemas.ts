import { z } from "zod";

// The acceptance wording for any bad stars value, including a missing one.
const StarsSchema = z
  .number({ error: "Please choose 1 to 5 stars" })
  .int("Please choose 1 to 5 stars")
  .min(1, "Please choose 1 to 5 stars")
  .max(5, "Please choose 1 to 5 stars");

// Mirrors the contract's POST /ratings body (upsert keyed on (postId, userId)).
export const UpsertRatingSchema = z.object({
  postId: z.string().min(1),
  stars: StarsSchema,
  comment: z.string().optional(),
});
export type UpsertRatingInput = z.infer<typeof UpsertRatingSchema>;

// Mirrors PUT /ratings/{id}: owner-only edit.
export const UpdateRatingSchema = z.object({
  stars: StarsSchema,
  comment: z.string().optional(),
});
export type UpdateRatingInput = z.infer<typeof UpdateRatingSchema>;

// Documented response shapes: exactly these fields, nothing internal.
export interface RatingResponse {
  id: string;
  postId: string;
  userId: string;
  stars: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingWithUserResponse extends RatingResponse {
  username: string;
}

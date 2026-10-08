import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { posts, ratings, users } from "../../db/schema";
import type {
  RatingResponse,
  RatingWithUserResponse,
  UpdateRatingInput,
  UpsertRatingInput,
} from "./ratings.schemas";

type RatingRow = typeof ratings.$inferSelect;

/** Rating fields with Date timestamps before serialization. */
interface RatingFields {
  id: string;
  postId: string;
  userId: string;
  stars: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ratings and reviews. One rating per user per post (upsert keyed on (postId, userId));
 * edits are owner-only, deletes also allowed for admin moderation.
 */
@Injectable()
export class RatingsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** A post's ratings and reviews with reviewer usernames, newest first. */
  async listForPost(postId: string): Promise<RatingWithUserResponse[]> {
    this.requirePost(postId);
    const rows = this.db
      .select({
        id: ratings.id,
        postId: ratings.postId,
        userId: ratings.userId,
        stars: ratings.stars,
        comment: ratings.comment,
        createdAt: ratings.createdAt,
        updatedAt: ratings.updatedAt,
        username: users.username,
      })
      .from(ratings)
      .innerJoin(users, eq(users.id, ratings.userId))
      .where(eq(ratings.postId, postId))
      .orderBy(desc(ratings.createdAt), sql`ratings.rowid desc`)
      .all();
    return rows.map(toRatingWithUser);
  }

  /** Creates the caller's rating for a post, or updates their existing one. */
  async upsert(user: AuthUser, input: UpsertRatingInput): Promise<{ rating: RatingResponse; created: boolean }> {
    this.requirePost(input.postId);
    const existing = this.db
      .select({ id: ratings.id })
      .from(ratings)
      .where(and(eq(ratings.postId, input.postId), eq(ratings.userId, user.id)))
      .get();
    if (existing) {
      const [updated] = this.db
        .update(ratings)
        .set({ stars: input.stars, comment: input.comment ?? null, updatedAt: new Date() })
        .where(eq(ratings.id, existing.id))
        .returning()
        .all();
      return { rating: toRating(updated), created: false };
    }
    const [created] = this.db
      .insert(ratings)
      .values({ postId: input.postId, userId: user.id, stars: input.stars, comment: input.comment ?? null })
      .returning()
      .all();
    return { rating: toRating(created), created: true };
  }

  /** Owner-only edit. */
  async update(user: AuthUser, id: string, input: UpdateRatingInput): Promise<RatingResponse> {
    const row = this.requireRating(id);
    if (row.userId !== user.id) {
      throw new AppError("FORBIDDEN", 403, "You can only edit your own rating");
    }
    const [updated] = this.db
      .update(ratings)
      .set({ stars: input.stars, comment: input.comment ?? null, updatedAt: new Date() })
      .where(eq(ratings.id, id))
      .returning()
      .all();
    return toRating(updated);
  }

  /** The owner, or an admin moderating any review. */
  async delete(user: AuthUser, id: string): Promise<void> {
    const row = this.requireRating(id);
    if (row.userId !== user.id && !this.isAdmin(user)) {
      throw new AppError("FORBIDDEN", 403, "Admin access required");
    }
    this.db.delete(ratings).where(eq(ratings.id, id)).run();
  }

  private requirePost(postId: string): void {
    const found = this.db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).get();
    if (!found) {
      throw new AppError("NOT_FOUND", 404, "Post not found");
    }
  }

  private requireRating(id: string): RatingRow {
    const found = this.db.select().from(ratings).where(eq(ratings.id, id)).get();
    if (!found) {
      throw new AppError("NOT_FOUND", 404, "Rating not found");
    }
    return found;
  }

  /** AuthUser carries only the id, so the role comes from the users table. */
  private isAdmin(user: AuthUser): boolean {
    return this.db.select({ role: users.role }).from(users).where(eq(users.id, user.id)).get()?.role === "admin";
  }
}

function toRating(row: RatingFields): RatingResponse {
  return {
    id: row.id,
    postId: row.postId,
    userId: row.userId,
    stars: row.stars,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toRatingWithUser(row: RatingFields & { username: string }): RatingWithUserResponse {
  return { ...toRating(row), username: row.username };
}

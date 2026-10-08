import { Inject, Injectable } from "@nestjs/common";
import { desc, eq, sql } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { posts, ratings, users } from "../../db/schema";
import type { PostInput, PostResponse, PostWithStatsResponse } from "./posts.schemas";

/** The post fields every stats row shares, with Date timestamps before serialization. */
interface PostFields {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Posts: public listing/detail plus the admin-only writes (tag `admin-posts` reuses this service).
 * `AuthUser` carries only the id, so the caller's role comes from the users table.
 */
@Injectable()
export class PostsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** Every post newest-first with average rating, review count and author username. */
  async listPosts(): Promise<PostWithStatsResponse[]> {
    const rows = this.db
      .select(this.statsSelect())
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .leftJoin(ratings, eq(ratings.postId, posts.id))
      .groupBy(posts.id)
      .orderBy(desc(posts.createdAt), sql`posts.rowid desc`)
      .all();
    return rows.map(toPostWithStats);
  }

  /** One post with stats; 404 when the id matches nothing. */
  async getPost(id: string): Promise<PostWithStatsResponse> {
    const found = this.db
      .select(this.statsSelect())
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .leftJoin(ratings, eq(ratings.postId, posts.id))
      .where(eq(posts.id, id))
      .groupBy(posts.id)
      .orderBy(desc(posts.createdAt), sql`posts.rowid desc`)
      .get();
    if (!found) {
      throw new AppError("NOT_FOUND", 404, "Post not found");
    }
    return toPostWithStats(found);
  }

  async createPost(user: AuthUser, input: PostInput): Promise<PostResponse> {
    this.requireAdmin(user);
    const [created] = this.db
      .insert(posts)
      .values({
        title: input.title,
        body: input.body,
        excerpt: input.excerpt ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        authorId: user.id,
      })
      .returning()
      .all();
    return toPost(created);
  }

  /** Full update of the editable fields; the updated timestamp always moves. */
  async updatePost(user: AuthUser, id: string, input: PostInput): Promise<PostResponse> {
    this.requireAdmin(user);
    const [updated] = this.db
      .update(posts)
      .set({
        title: input.title,
        body: input.body,
        excerpt: input.excerpt ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning()
      .all();
    if (!updated) {
      throw new AppError("NOT_FOUND", 404, "Post not found");
    }
    return toPost(updated);
  }

  /** Deletes the post together with all of its ratings and reviews. */
  async deletePost(user: AuthUser, id: string): Promise<void> {
    this.requireAdmin(user);
    this.db.transaction((tx) => {
      const found = tx.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).get();
      if (!found) {
        throw new AppError("NOT_FOUND", 404, "Post not found");
      }
      tx.delete(ratings).where(eq(ratings.postId, id)).run();
      tx.delete(posts).where(eq(posts.id, id)).run();
    });
  }

  private statsSelect() {
    return {
      id: posts.id,
      title: posts.title,
      body: posts.body,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorUsername: users.username,
      ratingCount: sql<number>`count(${ratings.id})`,
      averageRating: sql<number | null>`avg(${ratings.stars})`,
    };
  }

  private requireAdmin(user: AuthUser): void {
    const found = this.db.select({ role: users.role }).from(users).where(eq(users.id, user.id)).get();
    if (!found) {
      throw new AppError("UNAUTHENTICATED", 401, "Sign in required");
    }
    if (found.role !== "admin") {
      throw new AppError("FORBIDDEN", 403, "Admin access required");
    }
  }
}

function toPost(row: PostFields): PostResponse {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    authorId: row.authorId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPostWithStats(
  row: PostFields & { authorUsername: string; ratingCount: number; averageRating: number | null },
): PostWithStatsResponse {
  return { ...toPost(row), averageRating: row.averageRating, ratingCount: row.ratingCount, authorUsername: row.authorUsername };
}

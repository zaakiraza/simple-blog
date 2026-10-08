/**
 * Demo seed for UAT without an external DB. SQLite file (local or /tmp on Vercel) is the store;
 * this fills empty tables with realistic rows so the SPA is not blank.
 *
 * Demo logins (passwords hashed from ./demo-accounts):
 *   - admin@demo.local (role: admin)
 *   - user@demo.local  (role: user)
 *
 * Set SEED_DEMO=0 to skip.
 */
import { hashPassword } from "../common/auth";
import type { Db } from "./database";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "./demo-accounts";
import { posts, ratings, users } from "./schema";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export async function seedDemo(db: Db): Promise<void> {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    return; // already seeded
  }

  const [admin, reader] = await db
    .insert(users)
    .values([
      {
        email: DEMO_ADMIN_EMAIL,
        username: "admin",
        passwordHash: await hashPassword(DEMO_ADMIN_PASSWORD),
        role: "admin",
        createdAt: daysAgo(30),
      },
      {
        email: DEMO_USER_EMAIL,
        username: "reader",
        passwordHash: await hashPassword(DEMO_USER_PASSWORD),
        role: "user",
        createdAt: daysAgo(21),
      },
    ])
    .returning();

  const [welcome, sqlite, firstPost] = await db
    .insert(posts)
    .values([
      {
        title: "Welcome to the Simple Blog",
        body: "Thanks for stopping by. This blog is a small demo of a NestJS + Drizzle + SQLite stack: posts, star ratings and comments. Sign in, browse the posts, and leave a rating to let authors know what you think.",
        excerpt: "A quick tour of what this demo blog can do.",
        coverImageUrl: "https://images.demo.local/covers/welcome.jpg",
        authorId: admin.id,
        createdAt: daysAgo(14),
        updatedAt: daysAgo(14),
      },
      {
        title: "Why SQLite is enough for a small blog",
        body: "SQLite gets a bad rap, but for a read-heavy site like a blog it is hard to beat: one file, no server to babysit, and transactions for free. Pair it with Drizzle ORM and you get typed queries without a heavyweight client. Here is how this site stores posts and ratings with just four tables.",
        coverImageUrl: "https://images.demo.local/covers/sqlite.jpg",
        authorId: admin.id,
        createdAt: daysAgo(7),
        updatedAt: daysAgo(6),
      },
      {
        title: "My first post",
        body: "Hello from the demo user account! I created this post after signing up, rated a couple of articles, and left a comment or two. If you can read this, the seed data worked.",
        excerpt: "A first post from the demo user.",
        authorId: reader.id,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
    ])
    .returning();

  await db.insert(ratings).values([
    {
      postId: welcome.id,
      userId: reader.id,
      stars: 5,
      comment: "Great introduction — looking forward to more!",
      createdAt: daysAgo(13),
      updatedAt: daysAgo(13),
    },
    {
      postId: sqlite.id,
      userId: reader.id,
      stars: 4,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      postId: firstPost.id,
      userId: admin.id,
      stars: 5,
      comment: "Nice to see the demo flow working end to end.",
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ]);
}

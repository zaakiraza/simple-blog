import { Inject, Injectable } from "@nestjs/common";
import { eq, or } from "drizzle-orm";
import { type AuthUser, hashPassword, TokenService, verifyPassword } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { sessions, users } from "../../db/schema";
import type { AuthResult, LoginInput, SignupInput } from "./auth.schemas";

type UserRow = typeof users.$inferSelect;

/** Signup, login and logout. Sessions are rows in `sessions`; the access token is a JWT on the user id. */
@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly tokens: TokenService,
  ) {}

  /** Create a reader account (role "user"; admins are seeded only) and sign it in. */
  async signup(input: SignupInput): Promise<AuthResult> {
    const emailTaken = this.db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).get();
    if (emailTaken) {
      throw new AppError("CONFLICT", 409, "An account with this email already exists");
    }
    const usernameTaken = this.db.select({ id: users.id }).from(users).where(eq(users.username, input.username)).get();
    if (usernameTaken) {
      throw new AppError("CONFLICT", 409, "An account with this username already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const [created] = this.db
      .insert(users)
      .values({ email: input.email, username: input.username, passwordHash, role: "user" })
      .returning()
      .all();
    return this.issueAuthResult(created);
  }

  /** Sign in with email or username plus password. */
  async login(input: LoginInput): Promise<AuthResult> {
    const found = this.db
      .select()
      .from(users)
      .where(or(eq(users.email, input.identifier), eq(users.username, input.identifier)))
      .get();
    if (!found || !(await verifyPassword(input.password, found.passwordHash))) {
      throw new AppError("UNAUTHENTICATED", 401, "Email/username or password is incorrect");
    }
    return this.issueAuthResult(found);
  }

  /** Log out the caller: the token only carries the user id, so drop that user's sessions. */
  async logout(user: AuthUser): Promise<void> {
    this.db.delete(sessions).where(eq(sessions.userId, user.id)).run();
  }

  private issueAuthResult(user: UserRow): AuthResult {
    const [session] = this.db.insert(sessions).values({ userId: user.id }).returning().all();
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      session: {
        id: session.id,
        userId: session.userId,
        createdAt: session.createdAt.toISOString(),
      },
      accessToken: this.tokens.sign({ id: user.id }),
    };
  }
}

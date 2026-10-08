import { z } from "zod";

// Mirrors the contract request bodies for /auth/signup and /auth/login.
export const SignupSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
export type SignupInput = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Documented response shapes: exactly these fields, nothing internal.
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  createdAt: string;
}

export interface AuthResult {
  user: UserResponse;
  session: SessionResponse;
  accessToken: string;
}

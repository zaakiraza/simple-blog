import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { type AuthResult, type LoginInput, LoginSchema, type SignupInput, SignupSchema } from "./auth.schemas";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post("auth/signup")
  @HttpCode(201)
  auth_signup(@Body(new ZodValidationPipe(SignupSchema)) body: SignupInput): Promise<AuthResult> {
    return this.service.signup(body);
  }

  @Post("auth/login")
  @HttpCode(200)
  auth_login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginInput): Promise<AuthResult> {
    return this.service.login(body);
  }

  @Post("auth/logout")
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async auth_logout(@CurrentUser() user: AuthUser): Promise<void> {
    await this.service.logout(user);
  }
}

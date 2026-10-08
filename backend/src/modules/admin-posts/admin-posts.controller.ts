import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type PostInput,
  PostInputSchema,
  type PostResponse,
  type PostWithStatsResponse,
} from "../posts/posts.schemas";
import { PostsService } from "../posts/posts.service";

/** Admin-only post management (tag `admin-posts`); every handler needs an admin session. */
@Controller()
@UseGuards(JwtAuthGuard)
export class AdminPostsController {
  constructor(private readonly posts: PostsService) {}

  @Post("posts")
  @HttpCode(201)
  posts_create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(PostInputSchema)) body: PostInput,
  ): Promise<PostResponse> {
    return this.posts.createPost(user, body);
  }

  @Put("posts/:id")
  posts_update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(PostInputSchema)) body: PostInput,
  ): Promise<PostResponse> {
    return this.posts.updatePost(user, id, body);
  }

  @Delete("posts/:id")
  @HttpCode(204)
  async posts_delete(@CurrentUser() user: AuthUser, @Param("id") id: string): Promise<void> {
    await this.posts.deletePost(user, id);
  }

  @Get("admin/posts")
  admin_posts_list(): Promise<PostWithStatsResponse[]> {
    return this.posts.listPosts();
  }
}

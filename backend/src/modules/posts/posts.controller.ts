import { Controller, Get, Param } from "@nestjs/common";
import type { PostWithStatsResponse } from "./posts.schemas";
import { PostsService } from "./posts.service";

/** Public blog browsing: listing and detail need no sign-in. */
@Controller()
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get("posts")
  posts_list(): Promise<PostWithStatsResponse[]> {
    return this.service.listPosts();
  }

  @Get("posts/:id")
  posts_get(@Param("id") id: string): Promise<PostWithStatsResponse> {
    return this.service.getPost(id);
  }
}

import { Module } from "@nestjs/common";
import { PostsModule } from "../posts/posts.module";
import { AdminPostsController } from "./admin-posts.controller";

/** Feature module for the `admin-posts` tag; reuses PostsService from the posts module. */
@Module({
  imports: [PostsModule],
  controllers: [AdminPostsController],
})
export class AdminPostsModule {}

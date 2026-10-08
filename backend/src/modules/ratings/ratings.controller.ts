import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type RatingResponse,
  type RatingWithUserResponse,
  type UpdateRatingInput,
  UpdateRatingSchema,
  type UpsertRatingInput,
  UpsertRatingSchema,
} from "./ratings.schemas";
import { RatingsService } from "./ratings.service";

/** Ratings and reviews: the per-post listing is public; writes need a signed-in caller. */
@Controller()
export class RatingsController {
  constructor(private readonly service: RatingsService) {}

  @Get("posts/:id/ratings")
  post_ratings_list(@Param("id") id: string): Promise<RatingWithUserResponse[]> {
    return this.service.listForPost(id);
  }

  @Post("ratings")
  @UseGuards(JwtAuthGuard)
  async ratings_upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpsertRatingSchema)) body: UpsertRatingInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RatingResponse> {
    const { rating, created } = await this.service.upsert(user, body);
    res.status(created ? 201 : 200);
    return rating;
  }

  @Put("ratings/:id")
  @UseGuards(JwtAuthGuard)
  ratings_update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateRatingSchema)) body: UpdateRatingInput,
  ): Promise<RatingResponse> {
    return this.service.update(user, id, body);
  }

  @Delete("ratings/:id")
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async ratings_delete(@CurrentUser() user: AuthUser, @Param("id") id: string): Promise<void> {
    await this.service.delete(user, id);
  }
}

import { Module } from "@nestjs/common";
import { RatingsController } from "./ratings.controller";
import { RatingsService } from "./ratings.service";

/** Feature module for the `ratings` tag. */
@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}

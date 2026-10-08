import { Module, type Type } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AuthModule } from "./common/auth";
import { AllExceptionsFilter } from "./common/errors";
import { DbModule } from "./db/db.module";
import { HealthModule } from "./health/health.module";
import { AdminPostsModule } from "./modules/admin-posts/admin-posts.module";
import { AuthFeatureModule } from "./modules/auth/auth.module";
import { PostsModule } from "./modules/posts/posts.module";
import { RatingsModule } from "./modules/ratings/ratings.module";

/**
 * Feature modules, one per OpenAPI tag (`src/modules/<tag>/<tag>.module.ts`).
 * Add each new module here; the contract check only sees routes reachable from AppModule.
 */
export const FEATURE_MODULES: Type<unknown>[] = [AuthFeatureModule, PostsModule, AdminPostsModule, RatingsModule];

@Module({
  imports: [DbModule, AuthModule, HealthModule, ...FEATURE_MODULES],
  // Registered as a provider (not only in main.ts) so tests built from AppModule get the same envelope.
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}

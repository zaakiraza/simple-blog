import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

/** Feature module for the `auth` tag. Named ...Feature to avoid clashing with the global common AuthModule. */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthFeatureModule {}

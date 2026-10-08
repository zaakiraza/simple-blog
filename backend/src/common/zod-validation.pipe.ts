import { PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";
import { AppError, zodIssues } from "./errors";

/** `@Body(new ZodValidationPipe(Schema))`: parses input or throws 400 VALIDATION_ERROR with issue details. */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      // Surface the first field message ("Title is required", "Please choose 1 to 5 stars", ...)
      // as the envelope message; the full list stays in details.
      const issues = zodIssues(result.error);
      throw new AppError("VALIDATION_ERROR", 400, issues[0]?.message ?? "Request validation failed", { issues });
    }
    return result.data;
  }
}

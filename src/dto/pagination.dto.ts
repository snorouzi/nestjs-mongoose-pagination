import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNumber } from "class-validator";

/**
 * Data Transfer Object (DTO) for pagination.
 * This DTO is used to define pagination parameters for API requests.
 */
export class PaginationDto {
  /**
   * Page number for pagination.
   * Defaults to `1` if not provided.
   * @example 1
   */
  @ApiPropertyOptional({ type: "integer", example: 1 })
  @Transform((params) => (!params.value ? 1 : parseInt(params.value))) // Ensure the value is an integer; defaults to 1 if undefined.
  @IsNumber() // Validates that the value is a number.
  @Expose() // Exposes the property during serialization/deserialization.
  page: number;

  /**
   * Number of items per page for pagination.
   * Defaults to `10` if not provided.
   * @example 10
   */
  @ApiPropertyOptional({ type: "integer", example: 10 })
  @Transform((params) => (!params.value ? 10 : parseInt(params.value))) // Ensure the value is an integer; defaults to 10 if undefined.
  @IsNumber() // Validates that the value is a number.
  @Expose() // Exposes the property during serialization/deserialization.
  limit: number;

  /**
   * Calculates the number of items to skip for pagination.
   * This is useful for database queries that use `offset`.
   * @returns The calculated skip value based on the current page and limit.
   */
  get skip() {
    return (this.page - 1) * this.limit; // Compute the number of items to skip.
  }
}

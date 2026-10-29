import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

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
	@ApiPropertyOptional({ type: 'integer', example: 1 })
	@Transform(({ value }) => (value ? parseInt(value) : 1))
	@IsNumber()
	@Expose()
	page: number = 1;

	/**
	 * Number of items per page for pagination.
	 * Defaults to `10` if not provided.
	 * @example 10
	 */
	@ApiPropertyOptional({ type: 'integer', example: 10 })
	@Transform(({ value }) => (value ? parseInt(value) : 10))
	@IsNumber()
	@Expose()
	limit: number = 10;

  /**
   * Field to sort by.
   * @example 'name'
   */
  @ApiPropertyOptional({ example: 'name', description: 'field to sort by' })
  @IsOptional()
  @IsString()
  @Expose()
  sort?: string;

  /**
   * Sort order direction.
   * @example 'ASC'
   */
  /**
   * Sort order direction.
   * @example 'ASC'
   */
  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @Transform(({ value }: { value?: string | string[] | null }) => {
    if (value === undefined || value === null) return value;
    const normalized = Array.isArray(value) ? value[0] : value;
    return String(normalized).toUpperCase();
  })
  @IsIn(['ASC', 'DESC'])
  @Expose()
  order?: 'ASC' | 'DESC';

  /**
   * Search term to filter results.
   * @example 'john'
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Expose()
  search?: string;

	/**
	 * Calculates the number of items to skip for pagination.
	 * This is useful for database queries that use `offset`.
	 * @returns The calculated skip value based on the current page and limit.
	 */
	get skip() {
		return (this.page - 1) * this.limit;
	}
}

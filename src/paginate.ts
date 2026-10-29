import { Model, PipelineStage, ProjectionType, QueryFilter, SortOrder } from 'mongoose';
import { PaginationDto } from './dto/pagination.dto';
import { IPaginateResult } from './interfaces/pagination.interface';

/**
 * Utility function to paginate data using Mongoose's find query.
 *
 * @template T - The type of the documents being paginated.
 * @param {PaginationDto} paginationDto - DTO containing pagination parameters (page, limit, and skip).
 * @param {Model<T>} model - The Mongoose model for the collection.
 * @param {QueryFilter<T>} [filter={}] - Query filter used to match documents.
 * @param {ProjectionType<T>} [projection] - Fields to include or exclude from the result.
 * @param {Record<string, SortOrder>} [sort] - Sorting configuration.
 * @returns {Promise<IPaginateResult<T>>} A promise that resolves to a paginated result object.
 */
export async function mongoosePaginate<T>(
	paginationDto: PaginationDto,
	model: Model<T>,
	filter: QueryFilter<T> = {},
	projection?: ProjectionType<T>,
	sort?: Record<string, SortOrder>,
): Promise<IPaginateResult<T>> {
	// Count all matching documents
	const totalCount = await model.countDocuments(filter).exec();

	// Fetch paginated documents
	const items = await model
		.find(filter, projection)
		.sort(sort ?? {})
		.skip(paginationDto.skip)
		.limit(paginationDto.limit)
		.lean()
		.exec();

	// Calculate total number of pages
	const totalPage = Math.ceil(totalCount / paginationDto.limit);

	// Return paginated result with metadata
	return {
		data: items as T[],
		pagination: {
			totalPage,
			totalCount,
			currentPage: paginationDto.page,
			limit: paginationDto.limit,
			hasMore: paginationDto.page < totalPage,
		},
	};
}

/**
 * Utility function to paginate data using a Mongoose aggregation pipeline.
 *
 * This is useful for complex queries involving lookups, grouping,
 * projections, calculated fields, and other aggregation operations.
 *
 * @template T - The type of the aggregation result being paginated.
 * @param {PaginationDto} paginationDto - DTO containing pagination parameters (page, limit, and skip).
 * @param {Model<any>} model - The Mongoose model for the collection.
 * @param {PipelineStage[]} pipeline - Aggregation pipeline stages.
 * @returns {Promise<IPaginateResult<T>>} A promise that resolves to a paginated result object.
 */
export async function mongooseAggregatePaginate<T>(
	paginationDto: PaginationDto,
	model: Model<any>,
	pipeline: PipelineStage[],
): Promise<IPaginateResult<T>> {
	// Create a count pipeline to determine total matching records
	const countResult = await model.aggregate([...pipeline, { $count: 'total' }]).exec();

	// Extract total count from aggregation result
	const totalCount = countResult[0]?.total ?? 0;

	// Apply pagination stages to the aggregation pipeline
	const items = await model
		.aggregate([...pipeline, { $skip: paginationDto.skip }, { $limit: paginationDto.limit }])
		.exec();

	// Calculate total number of pages
	const totalPage = Math.ceil(totalCount / paginationDto.limit);

	// Return paginated result with metadata
	return {
		data: items as T[],
		pagination: {
			totalPage,
			totalCount,
			currentPage: paginationDto.page,
			limit: paginationDto.limit,
			hasMore: paginationDto.page < totalPage,
		},
	};
}

/**
 * Metadata for pagination details.
 */
export interface IPaginationMeta {
	totalPage: number; // Total number of pages
	totalCount: number; // Total number of items across all pages
	currentPage: number; // Current page number
	limit: number; // Number of items per page
	hasMore?: boolean; // Whether there is more pages or not
}

/**
 * Result of a paginated query.
 * @template T - The type of the items being paginated
 */
export interface IPaginateResult<T> {
	data: T[]; // The list of items for the current page
	pagination: IPaginationMeta; // Metadata about pagination
}

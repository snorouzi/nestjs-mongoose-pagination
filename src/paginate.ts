import { Model, Document } from "mongoose";
import { PaginationDto } from "./dto/pagination.dto";
import {
  IPaginatedResult,
  IPaginationLinks,
} from "./interfaces/pagination.interface";

/**
 * Utility function to paginate data using Mongoose's find or aggregate methods.
 *
 * @template T - The type of the documents being paginated.
 * @param {PaginationDto} paginationDto - DTO containing pagination parameters (page, limit, and skip).
 * @param {Model<T>} model - The Mongoose model for the collection.
 * @param {any} [queryOrPipeline] - Optional query object for find or aggregation pipeline.
 * @param {string} [link] - The endpoint to which the data retrieved from.
 * @param {boolean} [isAggregate=false] - Whether to use aggregate pipeline.
 * @returns {Promise<PaginatedResult<T>>} A promise that resolves to a paginated result object.
 */
export async function paginate<T extends Document>(
  paginationDto: PaginationDto,
  model: Model<T>,
  queryOrPipeline?: any,
  link?: string,
  isAggregate: boolean = false,
): Promise<IPaginatedResult<T>> {
  const { page, limit } = paginationDto;
  const skip = paginationDto.skip || (page - 1) * limit;

  let totalItems: number;
  let items: T[];

  if (isAggregate) {
    // Handle aggregate queries
    const countPipeline = [...queryOrPipeline, { $count: "total" }];
    const countResult = await model.aggregate(countPipeline).exec();
    totalItems = countResult.length > 0 ? countResult[0].total : 0;

    const paginationPipeline = [
      ...queryOrPipeline,
      {
        $project: {
          password: 0,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];
    items = await model.aggregate(paginationPipeline).exec();
  } else {
    // Handle normal find queries
    totalItems = await model.countDocuments(queryOrPipeline).exec();
    items = await model
      .find(queryOrPipeline, { password: 0 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // Return paginated result with metadata and links
  return {
    items,
    meta: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      firstItem: skip + 1,
    },
    links: getPaginationLinks(link, paginationDto, totalItems),
  };
}

/**
 * Generate pagination navigation links.
 *
 * @param {string} link - The endpoint to which the data retrieved from.
 * @param {IPaginationDto} paginationDto - DTO containing pagination parameters (page, limit, etc.).
 * @param {number} totalItems - Total number of items across all pages.
 * @returns {PaginationLinks} An object containing navigation links.
 */
function getPaginationLinks(
  link: string,
  paginationDto: PaginationDto,
  totalItems: number,
): IPaginationLinks {
  if (!link) return undefined;

  const totalPages = Math.ceil(totalItems / paginationDto.limit);

  return {
    first: `${link}?page=1&limit=${paginationDto.limit}`,
    previous:
      paginationDto.page > 1
        ? `${link}?page=${paginationDto.page - 1}&limit=${paginationDto.limit}`
        : "",
    next:
      paginationDto.page < totalPages
        ? `${link}?page=${paginationDto.page + 1}&limit=${paginationDto.limit}`
        : "",
    last: `${link}?page=${totalPages}&limit=${paginationDto.limit}`,
  };
}

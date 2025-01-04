# nestjs-mongoose-pagination

A lightweight, customizable, and developer-friendly pagination module for NestJS and Mongoose. This package provides a reusable utility for handling paginated responses with support for metadata and navigation links.

[![npm version](https://img.shields.io/npm/v/nestjs-mongoose-pagination.svg)](https://www.npmjs.com/package/nestjs-mongoose-pagination)

---

## Installation

Install the package via npm:

```bash
npm install nestjs-mongoose-pagination
```

Or with yarn:

```bash
yarn add nestjs-mongoose-pagination
```

---

## Features

- Easy integration with Mongoose and NestJS
- Customizable DTO for pagination
- Metadata for pagination (total items, current page, etc.)
- Navigation links (first, previous, next, last)
- Inspired by [nestjs-typeorm-paginate](https://www.npmjs.com/package/nestjs-typeorm-paginate)

---

## Usage

### Example: Controller and Service Implementation

#### Controller

```typescript
import { PaginationDto } from "nestjs-mongoose-pagination";
import { Controller, Get, Query } from "@nestjs/common";
import { CategoryService } from "./category.service";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Retrieve all categories
   * @param paginationDto - pagination related data
   */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(filteredPaginationData);
  }
}
```

#### Service with Find Option

```typescript
import {
  IPaginatedResult,
  paginate,
  PaginationDto,
} from "nestjs-mongoose-pagination";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument } from "./schema/user.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Retrieve all categories
   * @param paginationDto - pagination related data
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<CategoryEntity>> {
    // Generate database query
    const query = {}; // Find all (No filter)

    return paginate<CategoryDocument>(
      paginationDto,
      this.categoryModel,
      query,
      process.env.SERVER_LINK + "/category", // Optional
    );
  }
}
```

#### Service without Aggregate Option

```typescript
import {
  IPaginatedResult,
  paginate,
  PaginationDto,
} from "nestjs-mongoose-pagination";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument } from "./schema/user.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Retrieve all categories
   * @param paginationDto - pagination related data
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<CategoryEntity>> {
    // Mongoose aggregation pipeline
    const pipeline = [
      { $match: { status: "active" } },
      { $sort: { createdAt: -1 } },
    ];

    return paginate<CategoryDocument>(
      paginationDto,
      this.categoryModel,
      pipeline,
      process.env.SERVER_LINK + "/category", // Optional
      true, // Indicates usage of aggregation
    );
  }
}
```

---

## PaginationDto

`PaginationDto` is a Data Transfer Object (DTO) used to handle pagination parameters.

### Properties

| Property | Type   | Default | Description                               |
| -------- | ------ | ------- | ----------------------------------------- |
| `page`   | number | `1`     | The current page number.                  |
| `limit`  | number | `10`    | The number of items per page.             |
| `skip`   | number |         | The number of items to skip (calculated). |

---

## API Reference

### `paginate` Function

The `paginate` function handles pagination for Mongoose models.

#### Parameters

| Parameter         | Type            | Description                                               |
| ----------------- | --------------- | --------------------------------------------------------- |
| `paginationDto`   | `PaginationDto` | DTO containing pagination parameters (page, limit, etc.). |
| `model`           | `Model<T>`      | The Mongoose model.                                      |
| `queryOrPipeline` | `any`           | Optional Mongoose query or aggregation pipeline.          |
| `link`            | `string`        | The endpoint for generating navigation links.             |
| `isAggregate`     | `boolean`       | Whether to use an aggregation pipeline.                   |

#### Returns

A promise resolving to a `IPaginatedResult` object containing paginated data, metadata, and navigation links.

---

## Example Metadata

```json
{
  "items": [ ... ],
  "meta": {
    "totalItems": 100,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalPages": 10,
    "currentPage": 1,
    "firstItem": 1
  },
  "links": {
    "first": "https://example.com/categories?page=1&limit=10",
    "previous": "",
    "next": "https://example.com/categories?page=2&limit=10",
    "last": "https://example.com/categories?page=10&limit=10"
  }
}
```

## Contributing

We welcome contributions from the community! If you'd like to help improve this module, feel free to fork the repository and submit a pull request. Suggestions, bug reports, and feature requests are also highly encouraged.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

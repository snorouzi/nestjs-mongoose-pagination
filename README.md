# nestjs-mongoose-pagination

A lightweight, customizable, and developer-friendly pagination module for NestJS and Mongoose. This package provides reusable utilities for handling paginated responses with metadata.

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
- Customizable DTO for pagination (page, limit, sort, order, search)
- Metadata for pagination (total items, total pages, current page, etc.)
- Supports Mongoose `find` queries and aggregation pipelines
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

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }
}
```

#### Service with Find (Query)

```typescript
import {
  IPaginateResult,
  mongoosePaginate,
  PaginationDto,
} from "nestjs-mongoose-pagination";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument } from "./schema/category.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<IPaginateResult<CategoryDocument>> {
    // Generate database query
    const filter = {}; // Find all (No filter)

    return mongoosePaginate<CategoryDocument>(
      paginationDto,
      this.categoryModel,
      filter,
      { name: 1, createdAt: 1 }, // Optional projection
      { createdAt: -1 }, // Optional sort
    );
  }
}
```

#### Service with Aggregation

```typescript
import {
  IPaginateResult,
  mongooseAggregatePaginate,
  PaginationDto,
} from "nestjs-mongoose-pagination";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument } from "./schema/category.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<IPaginateResult<CategoryDocument>> {
    // Mongoose aggregation pipeline
    const pipeline = [
      { $match: { status: "active" } },
      { $sort: { createdAt: -1 } },
    ];

    return mongooseAggregatePaginate<CategoryDocument>(
      paginationDto,
      this.categoryModel,
      pipeline,
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
| `sort`   | string |         | Field to sort by.                         |
| `order`  | string |         | Sort order direction (`ASC` or `DESC`).   |
| `search` | string |         | Search term to filter results.            |

---

## API Reference

### `mongoosePaginate` Function

Paginates data using Mongoose's `find` query.

#### Parameters

| Parameter      | Type                       | Description                                               |
| -------------- | -------------------------- | --------------------------------------------------------- |
| `paginationDto` | `PaginationDto`           | DTO containing pagination parameters (page, limit, etc.). |
| `model`         | `Model<T>`                | The Mongoose model.                                      |
| `filter`        | `QueryFilter<T>`          | Optional query filter used to match documents.            |
| `projection`    | `ProjectionType<T>`       | Optional fields to include or exclude from the result.     |
| `sort`          | `Record<string, SortOrder>` | Optional sorting configuration.                          |

#### Returns

A promise resolving to a `IPaginateResult` object containing paginated data and metadata.

### `mongooseAggregatePaginate` Function

Paginates data using a Mongoose aggregation pipeline.

#### Parameters

| Parameter       | Type              | Description                                               |
| --------------- | ----------------- | --------------------------------------------------------- |
| `paginationDto` | `PaginationDto`   | DTO containing pagination parameters (page, limit, etc.). |
| `model`         | `Model<any>`      | The Mongoose model.                                      |
| `pipeline`      | `PipelineStage[]` | Aggregation pipeline stages.                             |

#### Returns

A promise resolving to a `IPaginateResult` object containing paginated data and metadata.

---

## Example Result

```json
{
  "data": [ ... ],
  "pagination": {
    "totalPage": 10,
    "totalCount": 100,
    "currentPage": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

## Contributing

We welcome contributions from the community! If you'd like to help improve this module, feel free to fork the repository and submit a pull request. Suggestions, bug reports, and feature requests are also highly encouraged.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
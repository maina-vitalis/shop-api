/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsEnum,
  IsDecimal,
  MinLength,
  MaxLength,
  IsPositive,
} from 'class-validator';
import {
  DimensionUnit,
  ProductStatus,
  WeightUnit,
} from '../../../generated/prisma/enums';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  shortDescription?: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  images?: any[];

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  costPerItem?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  length?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  height?: number;

  @IsOptional()
  @IsEnum(DimensionUnit)
  dimensionUnit?: DimensionUnit;

  @IsOptional()
  variantOptions?: any[];

  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoSlug?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @IsNotEmpty()
  @IsString()
  storeId!: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  images?: any[];

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  compareAtPrice?: number;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  costPerItem?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  length?: number;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsDecimal()
  @IsPositive()
  height?: number;

  @IsOptional()
  @IsEnum(DimensionUnit)
  dimensionUnit?: DimensionUnit;

  @IsOptional()
  variantOptions?: any[];

  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoSlug?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;
}

export class ProductDto {
  id!: string;
  name!: string;
  shortDescription?: string | null;
  description!: string;
  sku?: string | null;
  barcode?: string | null;
  category!: string;
  brand?: string | null;
  tags!: string[];
  status!: ProductStatus;
  images!: any;
  price!: number;
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  stock?: number | null;
  lowStockThreshold?: number | null;
  trackInventory!: boolean;
  requiresShipping!: boolean;
  weight?: number | null;
  weightUnit!: WeightUnit;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  dimensionUnit!: DimensionUnit;
  variantOptions!: any;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoSlug?: string | null;
  isFeatured!: boolean;
  isDigital!: boolean;
  storeId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

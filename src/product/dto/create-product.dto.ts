import { IsDecimalString } from '@/common/decorators/is-decimal.decorator';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  IsArray,
  IsUrl,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDecimalString()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return String(value);
  })
  price: string;

  @IsDecimalString()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value ? String(value) : null;
  })
  cost?: string;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @IsDecimalString()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value ? String(value) : null;
  })
  salePrice?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[];
}

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

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[];
}

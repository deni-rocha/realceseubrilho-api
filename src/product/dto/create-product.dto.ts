import { IsNotEmpty, IsString, IsOptional, IsNumber, IsInt, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: string;

  @IsOptional()
  @IsInt()
  stockQuantity?: number = 0;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

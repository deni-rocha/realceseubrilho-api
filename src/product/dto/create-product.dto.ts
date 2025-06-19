import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: string;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

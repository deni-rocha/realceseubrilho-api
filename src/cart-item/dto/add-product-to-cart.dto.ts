import { IsUUID, IsInt, Min } from 'class-validator';

export class AddProductToCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
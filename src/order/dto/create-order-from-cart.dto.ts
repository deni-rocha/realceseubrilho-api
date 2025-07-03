import { IsString } from 'class-validator';

export class CreateOrderFromCartDto {
  @IsString()
  userId: string;
}

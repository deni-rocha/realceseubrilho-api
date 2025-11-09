import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
  Matches,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class GuestOrderItem {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateGuestOrderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  guestName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:\+?55)?(?:\(?[1-9]{2}\)?)?(?:9)?[0-9]{8}$/, {
    message:
      'WhatsApp inválido. Use formato: 5511999999999 ou 11999999999 (apenas números)',
  })
  guestWhatsapp: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestOrderItem)
  items: GuestOrderItem[];
}

import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestEmailVerificationDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}

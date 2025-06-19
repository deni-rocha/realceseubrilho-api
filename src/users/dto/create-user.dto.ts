import { Role } from '@/role/entities/role.entity';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsBoolean,
  IsUUID,
  IsOptional,
} from 'class-validator';


export class CreateUserDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email inválido' })
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

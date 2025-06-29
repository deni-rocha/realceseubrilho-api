import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role.name 
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        verified: user.verified,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create({
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
      });

      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: 'CUSTOMER'
      };

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'CUSTOMER',
          verified: false,
        },
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }
}
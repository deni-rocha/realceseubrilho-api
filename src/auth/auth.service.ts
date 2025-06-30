import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { EmailService } from '@/email/email.service';
import { EmailVerificationToken } from '@/email/entities/email-verification-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RequestEmailVerificationDto } from '@/email/dto/request-email.verification.dto';
import { VerifyEmailDto } from '@/email/dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
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

      // Gerar token de verificação
      await this.generateAndSendVerificationToken(user.id, user.email, user.name);

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
        message: 'Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  async requestEmailVerification(requestDto: RequestEmailVerificationDto) {
    const user = await this.usersService.findByEmail(requestDto.email);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.verified) {
      throw new BadRequestException('E-mail já está verificado');
    }

    await this.generateAndSendVerificationToken(user.id, user.email, user.name);

    return {
      message: 'E-mail de verificação enviado com sucesso!',
    };
  }

  async verifyEmail(verifyDto: VerifyEmailDto) {
    const token = await this.emailVerificationTokenRepository.findOne({
      where: { token: verifyDto.token },
      relations: ['user'],
    });

    if (!token) {
      throw new BadRequestException('Token inválido');
    }

    if (token.used) {
      throw new BadRequestException('Token já foi utilizado');
    }

    if (token.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    // Marcar token como usado
    token.used = true;
    await this.emailVerificationTokenRepository.save(token);

    // Marcar usuário como verificado
    await this.usersService.markAsVerified(token.user.id);

    return {
      message: 'E-mail verificado com sucesso!',
    };
  }

  private async generateAndSendVerificationToken(userId: string, email: string, name: string) {
    // Invalidar tokens anteriores
    await this.emailVerificationTokenRepository.update(
      { user: { id: userId }, used: false },
      { used: true }
    );

    // Gerar novo token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24 horas

    const verificationToken = this.emailVerificationTokenRepository.create({
      token,
      expiresAt,
      user: { id: userId },
    });

    await this.emailVerificationTokenRepository.save(verificationToken);

    // Enviar e-mail
    await this.emailService.sendVerificationEmail(email, name, token);
  }
}
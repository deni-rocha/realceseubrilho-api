import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { EmailService } from '@/email/email.service';
import { EmailVerificationService } from '@/email/email-verification.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestEmailVerificationDto } from '@/email/dto/request-email.verification.dto';
import { VerifyEmailDto } from '@/email/dto/verify-email.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly dataSource: DataSource,
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
    // Iniciar transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Criar usuário
      const user = await this.usersService.createWithTransaction(
        registerDto,
        queryRunner
      );

      // 2. Gerar token de verificação
      const verificationToken = await this.emailVerificationService.createTokenWithTransaction(
        user.id,
        queryRunner
      );

      // 3. Enviar e-mail (se falhar, a transação será revertida)
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken.token
      );

      // 4. Se tudo der certo, commit da transação
      await queryRunner.commitTransaction();

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
      // 5. Se algo der errado, rollback da transação
      await queryRunner.rollbackTransaction();
      
      if (error instanceof ConflictException) {
        throw new ConflictException('Email já cadastrado');
      }
      
      // Log do erro para debugging
      console.error('Erro no registro:', error);
      throw new Error('Falha ao criar conta. Tente novamente.');
      
    } finally {
      // 6. Sempre liberar o queryRunner
      await queryRunner.release();
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
    const token = await this.emailVerificationService.findToken(verifyDto.token);

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
    await this.emailVerificationService.markTokenAsUsed(token.id);

    // Marcar usuário como verificado
    await this.usersService.markAsVerified(token.user.id);

    return {
      message: 'E-mail verificado com sucesso!',
    };
  }

  async testEmailConnection() {
    try {
      const result = await this.emailService.testConnection();
      return {
        success: true,
        message: 'Teste de conexão com e-mail realizado com sucesso!',
        details: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro no teste de conexão com e-mail',
        error: error.message,
      };
    }
  }

  private async generateAndSendVerificationToken(userId: string, email: string, name: string) {
    // Criar token usando o serviço
    const verificationToken = await this.emailVerificationService.createToken(userId);

    // Enviar e-mail
    await this.emailService.sendVerificationEmail(email, name, verificationToken.token);
  }
}
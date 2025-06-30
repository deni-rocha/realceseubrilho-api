import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { User } from '@/users/entities/user.entity';
import { Role } from '@/role/entities/role.entity';
import { UsersModule } from '@/users/users.module';
import { JWT_SECRET } from './constants/jwt.constants';
import { EmailModule } from '@/email/email.module';
import { EmailService } from '@/email/email.service';
import { EmailVerificationToken } from '@/email/entities/email-verification-token.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EmailModule,
    TypeOrmModule.forFeature([User, Role, EmailVerificationToken]),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
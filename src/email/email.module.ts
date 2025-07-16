import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationToken])],
  providers: [EmailService, EmailVerificationService],
  exports: [EmailService, EmailVerificationService],
})
export class EmailModule {}

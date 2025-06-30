import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifique seu e-mail - Realce Seu Brilho',
      template: 'verification-email',
      context: {
        name,
        verificationUrl,
        supportEmail: process.env.SUPPORT_EMAIL || 'suporte@realceseubrilho.com',
      },
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Redefinir senha - Realce Seu Brilho',
      template: 'password-reset',
      context: {
        name,
        resetUrl,
        supportEmail: process.env.SUPPORT_EMAIL || 'suporte@realceseubrilho.com',
      },
    });
  }
}
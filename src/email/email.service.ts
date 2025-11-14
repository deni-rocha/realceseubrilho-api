import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.setupTransporter();
  }

  private async setupTransporter(): Promise<void> {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      // Configurações adicionais para melhor performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 14, // Gmail permite 14 emails por segundo
    });

    // Verificar conexão
    await this.transporter.verify();
  }

  private loadTemplate(
    templateName: string,
  ): Promise<HandlebarsTemplateDelegate> {
    // Tentar diferentes caminhos possíveis
    const possiblePaths = [
      path.join(__dirname, 'templates', `${templateName}.hbs`),
      path.join(
        process.cwd(),
        'src',
        'email',
        'templates',
        `${templateName}.hbs`,
      ),
      path.join(
        process.cwd(),
        'dist',
        'email',
        'templates',
        `${templateName}.hbs`,
      ),
    ];

    let templatePath: string | null = null;

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }

    if (!templatePath) {
      throw new Error(
        `Template ${templateName} não encontrado. Caminhos tentados: ${possiblePaths.join(', ')}`,
      );
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Promise.resolve(handlebars.compile(templateContent));
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const template = await this.loadTemplate('verification-email');
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    const html = template({
      name,
      verificationUrl,
      supportEmail: this.configService.get<string>('SUPPORT_EMAIL'),
      appName: 'Realce Seu Brilho',
    });

    const mailOptions = {
      from: `"Realce Seu Brilho" <${this.configService.get<string>('SMTP_USER')}>`,
      to: email,
      subject: 'Verifique seu e-mail - Realce Seu Brilho',
      html,
      // Configurações adicionais para melhor entrega
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const template = await this.loadTemplate('password-reset');
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password/form?token=${token}`;

    const html = template({
      name,
      resetUrl,
      supportEmail: this.configService.get<string>('SUPPORT_EMAIL'),
      appName: 'Realce Seu Brilho',
    });

    const mailOptions = {
      from: `"Realce Seu Brilho" <${this.configService.get<string>('SMTP_USER')}>`,
      to: email,
      subject: 'Redefinir senha - Realce Seu Brilho',
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Conexão estabelecida com sucesso!' };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Erro desconhecido' };
    }
  }
}

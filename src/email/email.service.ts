import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.setupTransporter();
  }

  private async setupTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Configurações adicionais para melhor performance
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 14, // Gmail permite 14 emails por segundo
      });

      // Verificar conexão
      await this.transporter.verify();
      this.logger.log('✅ Conexão com Gmail estabelecida com sucesso!');
    } catch (error) {
      this.logger.error('❌ Erro na configuração do Gmail:', error);
      throw error;
    }
  }

  private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Tentar diferentes caminhos possíveis
    const possiblePaths = [
      path.join(__dirname, 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'src', 'email', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'dist', 'src', 'email', 'templates', `${templateName}.hbs`),
    ];

    let templatePath: string | null = null;
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }

    if (!templatePath) {
      throw new Error(`Template ${templateName} não encontrado. Caminhos tentados: ${possiblePaths.join(', ')}`);
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return handlebars.compile(templateContent);
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    try {
      const template = await this.loadTemplate('verification-email');
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      const html = template({
        name,
        verificationUrl,
        supportEmail: process.env.SUPPORT_EMAIL,
        appName: 'Realce Seu Brilho',
      });

      const mailOptions = {
        from: `"Realce Seu Brilho" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verifique seu e-mail - Realce Seu Brilho',
        html,
        // Configurações adicionais para melhor entrega
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ E-mail de verificação enviado para ${email}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar e-mail para ${email}:`, error);
      throw new Error('Falha ao enviar e-mail de verificação');
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    try {
      const template = await this.loadTemplate('password-reset');
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const html = template({
        name,
        resetUrl,
        supportEmail: process.env.SUPPORT_EMAIL,
        appName: 'Realce Seu Brilho',
      });

      const mailOptions = {
        from: `"Realce Seu Brilho" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Redefinir senha - Realce Seu Brilho',
        html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ E-mail de redefinição enviado para ${email}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar e-mail de redefinição para ${email}:`, error);
      throw new Error('Falha ao enviar e-mail de redefinição');
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexão com Gmail OK!');
      return { success: true, message: 'Conexão estabelecida com sucesso!' };
    } catch (error) {
      this.logger.error('❌ Erro na conexão com Gmail:', error);
      return { success: false, message: error.message };
    }
  }
}
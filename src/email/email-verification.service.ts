import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
  ) {}

  async createToken(userId: string): Promise<EmailVerificationToken> {
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

    return await this.emailVerificationTokenRepository.save(verificationToken);
  }

  async findToken(token: string): Promise<EmailVerificationToken | null> {
    return this.emailVerificationTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    await this.emailVerificationTokenRepository.update(
      { id: tokenId },
      { used: true }
    );
  }

  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.emailVerificationTokenRepository.delete({
      expiresAt: { $lt: now } as any,
    });
  }

  async createTokenWithTransaction(userId: string, queryRunner: QueryRunner): Promise<EmailVerificationToken> {
    // Invalidar tokens anteriores usando o queryRunner
    await queryRunner.manager.update(
      EmailVerificationToken,
      { user: { id: userId }, used: false },
      { used: true }
    );

    // Gerar novo token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const verificationToken = queryRunner.manager.create(EmailVerificationToken, {
      token,
      expiresAt,
      user: { id: userId },
    });

    return await queryRunner.manager.save(EmailVerificationToken, verificationToken);
  }
} 
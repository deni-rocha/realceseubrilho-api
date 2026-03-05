import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShortenedUrl } from '../entities/shortened-url.entity';
import { customAlphabet } from 'nanoid';

@Injectable()
export class UrlShortenerService {
  // Usa apenas caracteres alfanuméricos para URLs mais amigáveis
  private readonly nanoid = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    8,
  );

  constructor(private readonly configService: ConfigService) {}

  /**
   * Encurta uma URL e armazena o mapeamento no banco de dados
   * @param originalUrl - URL original que será encurtada
   * @param context - Contexto da URL (ex: 'order', 'product')
   * @param contextId - ID do contexto (ex: orderId, productId)
   * @returns A URL encurtada completa
   */
  async shortenUrl(
    originalUrl: string,
    context?: string,
    contextId?: string,
  ): Promise<string> {
    // Verifica se já existe uma URL encurtada para este contexto
    if (context && contextId) {
      const existing = await ShortenedUrl.findOne({
        where: { context, contextId, isActive: true },
      });

      if (existing) {
        return this.buildShortUrl(existing.shortCode);
      }
    }

    // Gera um novo código curto único
    let shortCode = this.nanoid();
    let exists = await ShortenedUrl.exists({ where: { shortCode } });

    while (exists) {
      shortCode = this.nanoid();
      exists = await ShortenedUrl.exists({ where: { shortCode } });
    }

    // Cria o registro no banco de dados
    const shortenedUrl = ShortenedUrl.create({
      shortCode,
      originalUrl,
      context,
      contextId,
      isActive: true,
    });

    await shortenedUrl.save();

    return this.buildShortUrl(shortCode);
  }

  /**
   * Constrói a URL encurtada completa a partir do código curto
   * @param shortCode - Código curto gerado
   * @returns URL encurtada completa
   */
  private buildShortUrl(shortCode: string): string {
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return `${baseUrl}/s/${shortCode}`;
  }

  /**
   * Redireciona para a URL original a partir do código curto
   * @param shortCode - Código curto da URL
   * @returns A URL original
   * @throws NotFoundException se a URL não existir ou estiver inativa
   */
  async redirectToOriginal(shortCode: string): Promise<string> {
    const shortenedUrl = await ShortenedUrl.findOne({
      where: { shortCode, isActive: true },
    });

    if (!shortenedUrl) {
      throw new NotFoundException('URL encurtada não encontrada ou expirada');
    }

    // Incrementa o contador de cliques
    shortenedUrl.clickCount += 1;
    await shortenedUrl.save();

    return shortenedUrl.originalUrl;
  }

  /**
   * Obtém informações sobre uma URL encurtada
   * @param shortCode - Código curto da URL
   * @returns Informações da URL encurtada
   */
  async getShortenedUrlInfo(shortCode: string) {
    const shortenedUrl = await ShortenedUrl.findOne({
      where: { shortCode },
    });

    if (!shortenedUrl) {
      throw new NotFoundException('URL encurtada não encontrada');
    }

    return {
      shortCode: shortenedUrl.shortCode,
      originalUrl: shortenedUrl.originalUrl,
      context: shortenedUrl.context,
      contextId: shortenedUrl.contextId,
      createdAt: shortenedUrl.createdAt,
      clickCount: shortenedUrl.clickCount,
      isActive: shortenedUrl.isActive,
    };
  }
}

import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UrlShortenerService } from '../services/url-shortener.service';

@Controller('s')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Get(':shortCode')
  async getOriginalUrl(@Param('shortCode') shortCode: string) {
    try {
      const originalUrl =
        await this.urlShortenerService.redirectToOriginal(shortCode);
      return {
        shortCode,
        originalUrl,
        redirected: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao buscar URL original');
    }
  }
}

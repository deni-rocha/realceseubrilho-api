import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlShortenerService } from './services/url-shortener.service';
import { UrlShortenerController } from './controllers/url-shortener.controller';
import { ShortenedUrl } from './entities/shortened-url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShortenedUrl])],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService],
  exports: [UrlShortenerService, TypeOrmModule],
})
export class CommonModule {}

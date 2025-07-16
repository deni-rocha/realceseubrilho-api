import { Product } from '@/product/entities/product.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';
import * as fs from 'fs/promises';
import { Repository } from 'typeorm';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    cloudinary.config(this.getCloudinaryConfig());
  }

  private getCloudinaryConfig(): ConfigOptions {
    return {
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    };
  }

  async uploadImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'produtos',
      public_id: productId,
      overwrite: true,
    });

    // Remove o arquivo local
    await fs.unlink(file.path);

    // Salva a URL no banco
    product.imageUrl = result.secure_url;
    await this.productRepository.save(product);

    return result.secure_url;
  }
}

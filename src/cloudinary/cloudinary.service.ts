import { Product } from '@/product/entities/product.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  /**
   * Faz upload de uma única imagem para o produto
   * @param productId - ID do produto
   * @param file - Arquivo de imagem
   * @returns URL segura da imagem
   */
  async uploadImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    // Gera um ID único para a imagem
    const imageId = `${productId}_${Date.now()}`;

    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'produtos',
      public_id: imageId,
      overwrite: false,
    });

    // Remove o arquivo local
    await fs.unlink(file.path);

    // Adiciona a URL ao array de imagens
    if (!product.imageUrls) {
      product.imageUrls = [];
    }
    product.imageUrls.push(result.secure_url);
    await this.productRepository.save(product);

    return result.secure_url;
  }

  /**
   * Faz upload de múltiplas imagens para o produto
   * @param productId - ID do produto
   * @param files - Array de arquivos de imagem
   * @returns Array de URLs seguras das imagens
   */
  async uploadMultipleImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const uploadPromises = files.map(async (file) => {
      const imageId = `${productId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'produtos',
        public_id: imageId,
        overwrite: false,
      });

      // Remove o arquivo local
      await fs.unlink(file.path);

      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Adiciona as URLs ao array de imagens
    if (!product.imageUrls) {
      product.imageUrls = [];
    }
    product.imageUrls.push(...imageUrls);
    await this.productRepository.save(product);

    return imageUrls;
  }

  /**
   * Remove uma imagem específica do produto
   * @param productId - ID do produto
   * @param imageUrl - URL da imagem a ser removida
   */
  async deleteImage(productId: string, imageUrl: string): Promise<void> {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new BadRequestException('URL da imagem inválida');
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    // Remove a URL do array
    product.imageUrls = product.imageUrls.filter((url) => url !== imageUrl);
    await this.productRepository.save(product);

    // Extrai o public_id da URL do Cloudinary e remove do Cloudinary
    try {
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem do Cloudinary:', error);
      // Não lança erro, pois a imagem já foi removida do banco
    }
  }

  /**
   * Extrai o public_id de uma URL do Cloudinary
   */
  private extractPublicIdFromUrl(url: string): string | null {
    const match = url.match(/\/produtos\/([^/.]+)/);
    return match ? `produtos/${match[1]}` : null;
  }
}

import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductCategory } from '@/product-category/entities/product-category.entity';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory]), CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

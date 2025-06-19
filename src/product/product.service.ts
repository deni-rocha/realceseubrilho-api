import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductCategory } from '@/product-category/entities/product-category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;
    let category: ProductCategory | null = null;

    if (categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Categoria de produto com ID "${categoryId}" não encontrada`);
      }
    }
 
    const newProduct = this.productRepository.create(
      category ? { ...productData, category } : { ...productData }
    );
    return this.productRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['category'] });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.categoryId) {
      const newCategory = await this.categoryRepository.findOne({ where: { id: updateProductDto.categoryId } });
      if (!newCategory) {
        throw new NotFoundException(`Categoria de produto com ID "${updateProductDto.categoryId}" não encontrada`);
      }
      product.category = newCategory;
    }

    Object.assign(product, updateProductDto);
    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }
  }

  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);
    product.stockQuantity += quantity;
    if (product.stockQuantity < 0) {
      product.stockQuantity = 0;
    }
    return this.productRepository.save(product);
  }
}
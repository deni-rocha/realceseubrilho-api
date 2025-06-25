import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(
    createProductCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    const newCategory = this.categoryRepository.create(
      createProductCategoryDto,
    );
    return this.categoryRepository.save(newCategory);
  }

  async findAll(): Promise<ProductCategory[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(
        `Categoria de produto com ID "${id}" não encontrada`,
      );
    }
    return category;
  }

  async update(
    id: string,
    updateProductCategoryDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    const category = await this.findOne(id);
    if (updateProductCategoryDto.name)
      category.name = updateProductCategoryDto.name;
    if (updateProductCategoryDto.description)
      category.description = updateProductCategoryDto.description;
    category.updatedAt = new Date();
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Categoria de produto com ID "${id}" não encontrada`,
      );
    }
  }
}

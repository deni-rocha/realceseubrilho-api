import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory } from './expense-category.enum';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      createdBy: null,
    });

    return this.expenseRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({
      relations: ['createdBy'],
      order: { expenseDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!expense) {
      throw new NotFoundException(`Despesa com ID "${id}" não encontrada`);
    }

    return expense;
  }

  async findByCategory(category: ExpenseCategory): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { category },
      relations: ['createdBy'],
      order: { expenseDate: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    if (startDate > endDate) {
      throw new BadRequestException(
        'A data inicial não pode ser maior que a data final',
      );
    }

    return this.expenseRepository.find({
      where: {
        expenseDate: Between(startDate, endDate),
      },
      relations: ['createdBy'],
      order: { expenseDate: 'DESC' },
    });
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id);

    Object.assign(expense, updateExpenseDto);

    return this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const result = await this.expenseRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Despesa com ID "${id}" não encontrada`);
    }
  }

  async getTotalByCategory(category: ExpenseCategory): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.category = :category', { category })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }

  async getTotalByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.expenseDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }

  async getTotalExpenses(): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total || '0');
  }

  async getExpensesByCategory(): Promise<
    { category: ExpenseCategory; total: number; count: number }[]
  > {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .addSelect('COUNT(expense.id)', 'count')
      .groupBy('expense.category')
      .getRawMany<{
        category: ExpenseCategory;
        total: string;
        count: string;
      }>();

    return result.map((item) => ({
      category: item.category,
      total: parseFloat(item.total || '0'),
      count: parseInt(item.count || '0', 10),
    }));
  }
}

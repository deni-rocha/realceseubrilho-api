import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory } from './expense-category.enum';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/role/role.enum';

@Controller('expenses')
@Roles(UserRole.ADMIN) // Apenas administradores podem gerenciar despesas
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  async findAll() {
    return this.expenseService.findAll();
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: ExpenseCategory) {
    return this.expenseService.findByCategory(category);
  }

  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.expenseService.findByDateRange(start, end);
  }

  @Get('total')
  async getTotalExpenses() {
    const total = await this.expenseService.getTotalExpenses();
    return { total };
  }

  @Get('total/category/:category')
  async getTotalByCategory(@Param('category') category: ExpenseCategory) {
    const total = await this.expenseService.getTotalByCategory(category);
    return { category, total };
  }

  @Get('total/date-range')
  async getTotalByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = await this.expenseService.getTotalByDateRange(start, end);
    return { startDate, endDate, total };
  }

  @Get('summary/by-category')
  async getExpensesByCategory() {
    return this.expenseService.getExpensesByCategory();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.expenseService.remove(id);
    return { message: 'Despesa removida com sucesso.' };
  }
}

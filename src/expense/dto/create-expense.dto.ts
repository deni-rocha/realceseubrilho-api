import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../expense-category.enum';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNotEmpty()
  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

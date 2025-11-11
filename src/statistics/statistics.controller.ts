import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/role/role.enum';

@Controller('statistics')
@Roles(UserRole.ADMIN) // Apenas administradores podem acessar estatísticas
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  async getDashboardSummary() {
    return this.statisticsService.getDashboardSummary();
  }

  @Get('financial')
  async getFinancialStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.statisticsService.getFinancialStatistics(start, end);
  }

  @Get('products/profitability')
  async getProductProfitability(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.statisticsService.getProductProfitability(start, end);
  }

  @Get('revenue/monthly')
  async getMonthlyRevenue(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.statisticsService.getMonthlyRevenue(year);
  }
}

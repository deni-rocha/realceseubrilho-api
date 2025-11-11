import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Order } from '@/order/entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { User } from '@/users/entities/user.entity';
import { ExpenseService } from '@/expense/expense.service';
import { OrderStatus } from '@/order/order-status.enum';
import {
  FinancialStatisticsDto,
  ProductProfitabilityDto,
  DashboardSummaryDto,
} from './dto/financial-statistics.dto';
import Decimal from 'decimal.js';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly expenseService: ExpenseService,
  ) {}

  async getFinancialStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<FinancialStatisticsDto> {
    // Define período padrão se não fornecido
    const start = startDate || new Date(new Date().getFullYear(), 0, 1); // Início do ano
    const end = endDate || new Date(); // Hoje

    // Buscar pedidos no período
    const orders = await this.orderRepository.find({
      where: {
        orderDate: Between(start, end),
      },
      relations: ['orderItems', 'orderItems.product'],
    });

    // Calcular receitas
    let totalRevenue = new Decimal(0);
    let totalRevenueCompleted = new Decimal(0);
    let totalRevenuePending = new Decimal(0);
    let totalCost = new Decimal(0);
    let totalCostCompleted = new Decimal(0);

    const ordersByStatus: { [key: string]: { count: number; total: number } } =
      {};

    for (const order of orders) {
      const orderAmount = new Decimal(order.totalAmount);

      // Receita total (todos os pedidos)
      totalRevenue = totalRevenue.plus(orderAmount);

      // Separar por status
      if (!ordersByStatus[order.status]) {
        ordersByStatus[order.status] = { count: 0, total: 0 };
      }
      ordersByStatus[order.status].count += 1;
      ordersByStatus[order.status].total += orderAmount.toNumber();

      // Receita de pedidos entregues
      if (order.status === OrderStatus.DELIVERED) {
        totalRevenueCompleted = totalRevenueCompleted.plus(orderAmount);
      }

      // Receita de pedidos pendentes
      if (
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.PROCESSING
      ) {
        totalRevenuePending = totalRevenuePending.plus(orderAmount);
      }

      // Calcular custo dos produtos vendidos
      for (const item of order.orderItems) {
        const cost = item.product.cost
          ? new Decimal(item.product.cost).mul(item.quantity)
          : new Decimal(0);

        totalCost = totalCost.plus(cost);

        if (order.status === OrderStatus.DELIVERED) {
          totalCostCompleted = totalCostCompleted.plus(cost);
        }
      }
    }

    // Buscar despesas no período
    const totalExpenses = await this.expenseService.getTotalByDateRange(
      start,
      end,
    );
    const expensesByCategory =
      await this.expenseService.getExpensesByCategory();

    // Calcular lucros
    const grossProfit = totalRevenue.minus(totalCost);
    const grossProfitCompleted =
      totalRevenueCompleted.minus(totalCostCompleted);
    const grossProfitMargin = totalRevenue.greaterThan(0)
      ? grossProfit.div(totalRevenue).mul(100)
      : new Decimal(0);

    const netProfit = grossProfit.minus(totalExpenses);
    const netProfitMargin = totalRevenue.greaterThan(0)
      ? netProfit.div(totalRevenue).mul(100)
      : new Decimal(0);

    return {
      totalRevenue: totalRevenue.toNumber(),
      totalRevenueCompleted: totalRevenueCompleted.toNumber(),
      totalRevenuePending: totalRevenuePending.toNumber(),
      totalCost: totalCost.toNumber(),
      totalCostCompleted: totalCostCompleted.toNumber(),
      grossProfit: grossProfit.toNumber(),
      grossProfitCompleted: grossProfitCompleted.toNumber(),
      grossProfitMargin: parseFloat(grossProfitMargin.toFixed(2)),
      totalExpenses,
      expensesByCategory,
      netProfit: netProfit.toNumber(),
      netProfitMargin: parseFloat(netProfitMargin.toFixed(2)),
      totalOrders: orders.length,
      ordersByStatus: Object.entries(ordersByStatus).map(([status, data]) => ({
        status,
        count: data.count,
        totalAmount: data.total,
      })),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }

  async getProductProfitability(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProductProfitabilityDto[]> {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Buscar todos os itens vendidos no período
    const orderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('orderItem.order', 'order')
      .where('order.orderDate BETWEEN :start AND :end', { start, end })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED],
      })
      .getMany();

    // Agrupar por produto
    const productStats: {
      [key: string]: {
        name: string;
        quantity: number;
        revenue: Decimal;
        cost: Decimal;
      };
    } = {};

    for (const item of orderItems) {
      const productId = item.product.id;

      if (!productStats[productId]) {
        productStats[productId] = {
          name: item.product.name,
          quantity: 0,
          revenue: new Decimal(0),
          cost: new Decimal(0),
        };
      }

      productStats[productId].quantity += item.quantity;
      productStats[productId].revenue = productStats[productId].revenue.plus(
        item.subtotal,
      );

      const productCost = item.product.cost
        ? new Decimal(item.product.cost).mul(item.quantity)
        : new Decimal(0);
      productStats[productId].cost =
        productStats[productId].cost.plus(productCost);
    }

    // Converter para DTO
    return Object.entries(productStats).map(([productId, stats]) => {
      const grossProfit = stats.revenue.minus(stats.cost);
      const profitMargin = stats.revenue.greaterThan(0)
        ? grossProfit.div(stats.revenue).mul(100)
        : new Decimal(0);

      return {
        productId,
        productName: stats.name,
        totalSold: stats.quantity,
        totalRevenue: stats.revenue.toNumber(),
        totalCost: stats.cost.toNumber(),
        grossProfit: grossProfit.toNumber(),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      };
    });
  }

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    // Contar totais
    const totalUsers = await this.userRepository.count();
    const totalProducts = await this.productRepository.count();
    const totalOrders = await this.orderRepository.count();

    // Produtos com estoque baixo
    const lowStockProducts = await this.productRepository.count({
      where: {
        stockQuantity: Between(1, 10),
      },
    });

    const outOfStockProducts = await this.productRepository.count({
      where: {
        stockQuantity: 0,
      },
    });

    // Pedidos por status
    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    const processingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PROCESSING },
    });

    const shippedOrders = await this.orderRepository.count({
      where: { status: OrderStatus.SHIPPED },
    });

    // Calcular receita total (apenas pedidos entregues para precisão)
    const completedOrders = await this.orderRepository.find({
      where: {
        status: In([OrderStatus.DELIVERED]),
      },
      relations: ['orderItems', 'orderItems.product'],
    });

    let totalRevenue = new Decimal(0);
    let totalCost = new Decimal(0);

    for (const order of completedOrders) {
      totalRevenue = totalRevenue.plus(order.totalAmount);

      for (const item of order.orderItems) {
        if (item.product.cost) {
          const cost = new Decimal(item.product.cost).mul(item.quantity);
          totalCost = totalCost.plus(cost);
        }
      }
    }

    // Despesas totais
    const totalExpenses = await this.expenseService.getTotalExpenses();

    // Lucros
    const grossProfit = totalRevenue.minus(totalCost);
    const netProfit = grossProfit.minus(totalExpenses);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.toNumber(),
      totalExpenses,
      totalCost: totalCost.toNumber(),
      grossProfit: grossProfit.toNumber(),
      netProfit: netProfit.toNumber(),
      lowStockProducts,
      outOfStockProducts,
      pendingOrders,
      processingOrders,
      shippedOrders,
    };
  }

  async getMonthlyRevenue(year: number): Promise<
    {
      month: number;
      revenue: number;
      cost: number;
      profit: number;
      orders: number;
    }[]
  > {
    const monthlyData: {
      [key: number]: {
        revenue: Decimal;
        cost: Decimal;
        orders: number;
      };
    } = {};

    // Inicializar todos os meses
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = {
        revenue: new Decimal(0),
        cost: new Decimal(0),
        orders: 0,
      };
    }

    // Buscar pedidos do ano
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const orders = await this.orderRepository.find({
      where: {
        orderDate: Between(startDate, endDate),
        status: In([OrderStatus.DELIVERED, OrderStatus.SHIPPED]),
      },
      relations: ['orderItems', 'orderItems.product'],
    });

    // Agrupar por mês
    for (const order of orders) {
      const month = new Date(order.orderDate).getMonth() + 1;

      monthlyData[month].revenue = monthlyData[month].revenue.plus(
        order.totalAmount,
      );
      monthlyData[month].orders += 1;

      for (const item of order.orderItems) {
        if (item.product.cost) {
          const cost = new Decimal(item.product.cost).mul(item.quantity);
          monthlyData[month].cost = monthlyData[month].cost.plus(cost);
        }
      }
    }

    // Converter para array
    return Object.entries(monthlyData).map(([month, data]) => ({
      month: parseInt(month, 10),
      revenue: data.revenue.toNumber(),
      cost: data.cost.toNumber(),
      profit: data.revenue.minus(data.cost).toNumber(),
      orders: data.orders,
    }));
  }
}

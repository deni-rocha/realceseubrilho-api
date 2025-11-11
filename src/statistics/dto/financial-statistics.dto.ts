export class FinancialStatisticsDto {
  // Receitas
  totalRevenue: number;
  totalRevenueCompleted: number; // Apenas pedidos entregues
  totalRevenuePending: number; // Pedidos pendentes

  // Custos dos produtos vendidos
  totalCost: number;
  totalCostCompleted: number;

  // Lucro bruto (receita - custo dos produtos)
  grossProfit: number;
  grossProfitCompleted: number;
  grossProfitMargin: number; // Percentual

  // Despesas operacionais
  totalExpenses: number;
  expensesByCategory: {
    category: string;
    total: number;
    count: number;
  }[];

  // Lucro líquido (lucro bruto - despesas)
  netProfit: number;
  netProfitMargin: number; // Percentual

  // Estatísticas de pedidos
  totalOrders: number;
  ordersByStatus: {
    status: string;
    count: number;
    totalAmount: number;
  }[];

  // Período da análise
  startDate?: string;
  endDate?: string;
}

export class ProductProfitabilityDto {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export class DashboardSummaryDto {
  // Resumo geral
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;

  // Financeiro
  totalExpenses: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;

  // Produtos
  lowStockProducts: number;
  outOfStockProducts: number;

  // Pedidos recentes
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
}

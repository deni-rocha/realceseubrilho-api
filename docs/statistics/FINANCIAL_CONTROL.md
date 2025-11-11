# Sistema de Controle Financeiro - Realce Seu Brilho API

## 📊 Visão Geral

Este documento descreve o sistema completo de controle financeiro implementado na API, incluindo rastreamento de receitas, custos, despesas e cálculo de lucros.

## 🆕 Novas Funcionalidades

### 1. **Módulo de Despesas (Expenses)**

Sistema completo para registro e gerenciamento de despesas operacionais da empresa.

#### Entidade Expense

- `id`: UUID único da despesa
- `description`: Descrição da despesa
- `amount`: Valor da despesa
- `category`: Categoria (enum)
- `expenseDate`: Data da despesa
- `notes`: Observações adicionais
- `receiptUrl`: URL do comprovante/nota fiscal
- `createdBy`: Usuário que registrou a despesa

#### Categorias de Despesas

- `INVENTORY`: Compra de produtos/estoque
- `MARKETING`: Publicidade, anúncios
- `SHIPPING`: Custos de envio/frete
- `PACKAGING`: Embalagens
- `OPERATIONAL`: Aluguel, luz, água, internet
- `SALARY`: Salários e encargos
- `TAXES`: Impostos
- `MAINTENANCE`: Manutenção de equipamentos
- `SOFTWARE`: Assinaturas de software
- `OTHER`: Outras despesas

### 2. **Custo de Produtos**

Adicionado campo `cost` na entidade `Product` para registrar o custo de aquisição/produção de cada produto, permitindo cálculo de margem de lucro.

### 3. **Módulo de Estatísticas (Statistics)**

Sistema de análise financeira com endpoints agregados para dashboard e relatórios.

## 🔌 Endpoints da API

### Despesas (Expenses)

**Base URL:** `/expenses`

**⚠️ Todos os endpoints requerem autenticação e role ADMIN**

#### Criar Despesa
```
POST /expenses
Body: {
  "description": "Compra de embalagens",
  "amount": 250.00,
  "category": "PACKAGING",
  "expenseDate": "2024-01-15",
  "notes": "Caixas personalizadas",
  "receiptUrl": "https://..."
}
```

#### Listar Todas as Despesas
```
GET /expenses
```

#### Buscar Despesa por ID
```
GET /expenses/:id
```

#### Buscar Despesas por Categoria
```
GET /expenses/category/:category
Exemplo: GET /expenses/category/MARKETING
```

#### Buscar Despesas por Período
```
GET /expenses/date-range?startDate=2024-01-01&endDate=2024-12-31
```

#### Total de Despesas
```
GET /expenses/total
Response: { "total": 15000.00 }
```

#### Total por Categoria
```
GET /expenses/total/category/:category
Response: { "category": "MARKETING", "total": 3500.00 }
```

#### Total por Período
```
GET /expenses/total/date-range?startDate=2024-01-01&endDate=2024-12-31
Response: { "startDate": "...", "endDate": "...", "total": 8000.00 }
```

#### Resumo por Categoria
```
GET /expenses/summary/by-category
Response: [
  {
    "category": "MARKETING",
    "total": 3500.00,
    "count": 12
  },
  ...
]
```

#### Atualizar Despesa
```
PATCH /expenses/:id
Body: { "amount": 300.00 }
```

#### Deletar Despesa
```
DELETE /expenses/:id
```

---

### Estatísticas (Statistics)

**Base URL:** `/statistics`

**⚠️ Todos os endpoints requerem autenticação e role ADMIN**

#### Dashboard Resumido
```
GET /statistics/dashboard

Response: {
  "totalUsers": 150,
  "totalProducts": 80,
  "totalOrders": 450,
  "totalRevenue": 125000.00,
  "totalExpenses": 35000.00,
  "totalCost": 60000.00,
  "grossProfit": 65000.00,
  "netProfit": 30000.00,
  "lowStockProducts": 5,
  "outOfStockProducts": 2,
  "pendingOrders": 12,
  "processingOrders": 8,
  "shippedOrders": 3
}
```

#### Estatísticas Financeiras Detalhadas
```
GET /statistics/financial?startDate=2024-01-01&endDate=2024-12-31

Response: {
  "totalRevenue": 125000.00,
  "totalRevenueCompleted": 120000.00,
  "totalRevenuePending": 5000.00,
  "totalCost": 60000.00,
  "totalCostCompleted": 58000.00,
  "grossProfit": 65000.00,
  "grossProfitCompleted": 62000.00,
  "grossProfitMargin": 52.00,
  "totalExpenses": 35000.00,
  "expensesByCategory": [
    {
      "category": "MARKETING",
      "total": 8000.00,
      "count": 15
    },
    ...
  ],
  "netProfit": 30000.00,
  "netProfitMargin": 24.00,
  "totalOrders": 450,
  "ordersByStatus": [
    {
      "status": "DELIVERED",
      "count": 420,
      "totalAmount": 120000.00
    },
    ...
  ],
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

#### Lucratividade por Produto
```
GET /statistics/products/profitability?startDate=2024-01-01&endDate=2024-12-31

Response: [
  {
    "productId": "uuid",
    "productName": "Brinco Dourado",
    "totalSold": 45,
    "totalRevenue": 4500.00,
    "totalCost": 1800.00,
    "grossProfit": 2700.00,
    "profitMargin": 60.00
  },
  ...
]
```

#### Receita Mensal
```
GET /statistics/revenue/monthly?year=2024

Response: [
  {
    "month": 1,
    "revenue": 12000.00,
    "cost": 5500.00,
    "profit": 6500.00,
    "orders": 45
  },
  {
    "month": 2,
    "revenue": 15000.00,
    "cost": 7000.00,
    "profit": 8000.00,
    "orders": 52
  },
  ...
]
```

## 💡 Como Funciona

### Cálculo de Receita Total

A receita é calculada a partir do campo `totalAmount` dos pedidos (tabela `orders`). 

**Quando é atualizada:**
- Automaticamente ao criar um pedido via `POST /orders` ou `POST /orders/guest`
- Calculada multiplicando `unitPrice × quantity` para cada item do pedido

**Filtros importantes:**
- Receita total: soma de TODOS os pedidos
- Receita completada: apenas pedidos com status `DELIVERED`
- Receita pendente: pedidos com status `PENDING` ou `PROCESSING`

### Cálculo de Custo

O custo dos produtos vendidos é calculado usando o campo `cost` da tabela `products`.

**Fórmula:**
```
Custo Total = Σ(product.cost × quantity) para cada item vendido
```

### Cálculo de Lucro

#### Lucro Bruto (Gross Profit)
```
Lucro Bruto = Receita Total - Custo dos Produtos Vendidos
Margem de Lucro Bruto = (Lucro Bruto / Receita Total) × 100
```

#### Lucro Líquido (Net Profit)
```
Lucro Líquido = Lucro Bruto - Despesas Operacionais
Margem de Lucro Líquido = (Lucro Líquido / Receita Total) × 100
```

### Controle de Status dos Pedidos

Para análises financeiras precisas, considere:

- **DELIVERED**: Receita confirmada, incluir em todos os cálculos
- **SHIPPED**: Receita em trânsito, incluir em cálculos
- **PROCESSING/PENDING**: Receita potencial, separar em análises
- **CANCELLED/REFUNDED**: Não incluir em cálculos de receita

## 🗄️ Migração de Banco de Dados

Execute a migração para criar as novas tabelas e colunas:

```bash
npm run migration:run
```

A migração `AddExpensesAndProductCost` irá:
1. Adicionar coluna `cost` na tabela `products`
2. Criar tabela `expenses` com todas as colunas necessárias
3. Criar foreign key entre `expenses.created_by_user_id` e `users.id`

## 📝 Atualizações Necessárias

### 1. Atualizar Produtos Existentes

Após a migração, você deve atualizar os produtos existentes para incluir o custo:

```sql
UPDATE products SET cost = 0 WHERE cost IS NULL;
```

Ou via API:
```
PATCH /products/:id
Body: { "cost": 25.50 }
```

### 2. Registrar Despesas Históricas (Opcional)

Se desejar análises históricas, registre despesas passadas:

```
POST /expenses
Body: {
  "description": "Despesa histórica - Janeiro 2024",
  "amount": 1500.00,
  "category": "OPERATIONAL",
  "expenseDate": "2024-01-15"
}
```

## 🎯 Melhores Práticas

1. **Registre custos de produtos**: Sempre preencha o campo `cost` ao criar/atualizar produtos
2. **Categorize despesas corretamente**: Use as categorias apropriadas para análises precisas
3. **Anexe comprovantes**: Use o campo `receiptUrl` para guardar links de notas fiscais
4. **Análises periódicas**: Use filtros de data para análises mensais/trimestrais/anuais
5. **Monitore margem de lucro**: Produtos com margem baixa podem precisar de ajuste de preço
6. **Status dos pedidos**: Considere apenas pedidos `DELIVERED` para análises financeiras finais

## 🔐 Segurança

- Todos os endpoints de despesas e estatísticas requerem **role ADMIN**
- Use autenticação JWT em todas as requisições
- Audite quem cria/edita despesas através do campo `createdBy`

## 📊 Exemplos de Uso

### Análise Mensal
```javascript
// Receita do mês atual
const startDate = new Date(2024, 0, 1).toISOString();
const endDate = new Date(2024, 0, 31).toISOString();

const stats = await fetch(
  `/statistics/financial?startDate=${startDate}&endDate=${endDate}`
);
```

### Dashboard Completo
```javascript
// Buscar todos os dados do dashboard
const dashboard = await fetch('/statistics/dashboard');

// Buscar produtos mais lucrativos
const profitability = await fetch('/statistics/products/profitability');

// Buscar despesas por categoria
const expensesSummary = await fetch('/expenses/summary/by-category');
```

### Controle de Despesas
```javascript
// Registrar nova despesa
await fetch('/expenses', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Anúncio Google Ads',
    amount: 500.00,
    category: 'MARKETING',
    expenseDate: '2024-01-20'
  })
});

// Ver total de marketing do ano
const marketingTotal = await fetch(
  '/expenses/total/category/MARKETING'
);
```

## 🚀 Próximos Passos Sugeridos

1. Criar dashboard visual no frontend usando estes endpoints
2. Implementar alertas para produtos com margem de lucro baixa
3. Adicionar exportação de relatórios em PDF/Excel
4. Implementar metas de receita e comparação com realizado
5. Criar gráficos de tendência de receita/lucro

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação da API ou entre em contato com a equipe de desenvolvimento.

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Autor:** Sistema Realce Seu Brilho
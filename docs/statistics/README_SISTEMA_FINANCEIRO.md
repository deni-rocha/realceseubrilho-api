# 💰 Sistema de Controle Financeiro - Realce Seu Brilho

## 📖 Visão Geral

Sistema completo de controle financeiro implementado na API Realce Seu Brilho, permitindo rastreamento de receitas, custos, despesas operacionais e cálculo automático de lucros (bruto e líquido).

## ✨ Funcionalidades Implementadas

### 1. 🧾 Módulo de Despesas (Expenses)
- Registro completo de despesas operacionais
- 10 categorias pré-definidas (Marketing, Operacional, Estoque, etc)
- Upload de comprovantes/notas fiscais
- Filtros por categoria, período e valor
- Relatórios agregados por categoria

### 2. 📦 Custo de Produtos
- Campo `cost` adicionado à entidade `Product`
- Cálculo automático de margem de lucro por produto
- Suporte para análise de lucratividade individual

### 3. 📊 Módulo de Estatísticas (Statistics)
- Dashboard resumido com KPIs principais
- Estatísticas financeiras detalhadas
- Análise de lucratividade por produto
- Receita mensal agregada
- Cálculo automático de lucro bruto e líquido

## 🎯 Como Funciona

### Fluxo de Cálculo Financeiro

```
┌─────────────────┐
│  RECEITA TOTAL  │ ← Soma de order.totalAmount (pedidos DELIVERED)
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌──────────────────┐
│ CUSTO PRODUTOS  │                  │    DESPESAS      │
│  (Product.cost  │                  │   (Expenses)     │
│  × quantidade)  │                  │  Operacionais    │
└────────┬────────┘                  └────────┬─────────┘
         │                                    │
         └──────────┬─────────────────────────┘
                    │
                    ▼
         ┌───────────────────┐
         │   LUCRO BRUTO     │ = Receita - Custo Produtos
         │  (Gross Profit)   │
         └─────────┬─────────┘
                   │
                   │ (- Despesas)
                   │
                   ▼
         ┌───────────────────┐
         │  LUCRO LÍQUIDO    │ = Lucro Bruto - Despesas
         │   (Net Profit)    │
         └───────────────────┘
```

## 🚀 Instalação Rápida

```bash
# 1. Executar migração do banco de dados
npm run migration:run

# 2. Reiniciar o servidor
npm run start:dev

# 3. Verificar instalação
curl http://localhost:3000/statistics/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

## 📡 Principais Endpoints

### Despesas

```bash
# Criar despesa
POST /expenses
{
  "description": "Anúncio Google Ads",
  "amount": 500.00,
  "category": "MARKETING",
  "expenseDate": "2024-01-20"
}

# Listar todas
GET /expenses

# Total por categoria
GET /expenses/summary/by-category

# Total no período
GET /expenses/total/date-range?startDate=2024-01-01&endDate=2024-12-31
```

### Estatísticas

```bash
# Dashboard resumido
GET /statistics/dashboard
Response: {
  "totalRevenue": 125000.00,
  "totalExpenses": 35000.00,
  "grossProfit": 65000.00,
  "netProfit": 30000.00,
  ...
}

# Análise financeira detalhada
GET /statistics/financial?startDate=2024-01-01&endDate=2024-12-31

# Lucratividade por produto
GET /statistics/products/profitability

# Receita mensal
GET /statistics/revenue/monthly?year=2024
```

### Produtos (atualizado)

```bash
# Criar produto com custo
POST /products
{
  "name": "Brinco Dourado",
  "price": "100.00",
  "cost": 40.00,  # <-- NOVO CAMPO
  "stockQuantity": 50
}

# Atualizar custo
PATCH /products/:id
{
  "cost": 45.00
}
```

## 📊 Categorias de Despesas

| Categoria | Descrição | Exemplos |
|-----------|-----------|----------|
| `INVENTORY` | Compra de produtos/estoque | Compra de matéria-prima, fornecedores |
| `MARKETING` | Publicidade e propaganda | Google Ads, Facebook Ads, influencers |
| `SHIPPING` | Custos de envio | Correios, transportadoras |
| `PACKAGING` | Embalagens | Caixas, sacolas, fitas |
| `OPERATIONAL` | Custos operacionais | Aluguel, luz, água, internet |
| `SALARY` | Salários e encargos | Funcionários, impostos trabalhistas |
| `TAXES` | Impostos | ISS, ICMS, outros tributos |
| `MAINTENANCE` | Manutenção | Equipamentos, reparos |
| `SOFTWARE` | Software e serviços | Hospedagem, SaaS, ferramentas |
| `OTHER` | Outras despesas | Despesas diversas |

## 💡 Métricas Calculadas

### Lucro Bruto
```
Lucro Bruto = Receita Total - Custo dos Produtos Vendidos
Margem Bruta (%) = (Lucro Bruto / Receita Total) × 100
```

### Lucro Líquido
```
Lucro Líquido = Lucro Bruto - Despesas Operacionais
Margem Líquida (%) = (Lucro Líquido / Receita Total) × 100
```

### Exemplo Prático
```
Receita:        R$ 10.000,00
Custo Produtos: R$  4.000,00
─────────────────────────────
Lucro Bruto:    R$  6.000,00  (60%)

Despesas:       R$  2.500,00
─────────────────────────────
Lucro Líquido:  R$  3.500,00  (35%)
```

## 🗄️ Estrutura do Banco de Dados

### Nova Tabela: `expenses`
```sql
expenses (
  id UUID PRIMARY KEY,
  description VARCHAR(255),
  amount DECIMAL(10,2),
  category ENUM,
  expense_date DATE,
  notes TEXT,
  receipt_url VARCHAR,
  created_by_user_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Atualização: `products`
```sql
products (
  ...campos existentes...,
  cost DECIMAL(10,2)  -- NOVO CAMPO
)
```

## 📁 Estrutura de Arquivos

```
src/
├── expense/
│   ├── dto/
│   │   ├── create-expense.dto.ts
│   │   └── update-expense.dto.ts
│   ├── entities/
│   │   └── expense.entity.ts
│   ├── expense-category.enum.ts
│   ├── expense.controller.ts
│   ├── expense.service.ts
│   └── expense.module.ts
│
├── statistics/
│   ├── dto/
│   │   └── financial-statistics.dto.ts
│   ├── statistics.controller.ts
│   ├── statistics.service.ts
│   └── statistics.module.ts
│
└── database/
    └── migrations/
        └── 1762900000000-AddExpensesAndProductCost.ts
```

## 🔒 Segurança

- ✅ Todos os endpoints requerem autenticação JWT
- ✅ Apenas usuários com role `ADMIN` podem acessar
- ✅ Validação de dados com class-validator
- ✅ Auditoria de quem criou cada despesa

## 📚 Documentação Completa

- **[FINANCIAL_CONTROL.md](./FINANCIAL_CONTROL.md)** - Documentação completa da API
- **[INSTALACAO_CONTROLE_FINANCEIRO.md](./INSTALACAO_CONTROLE_FINANCEIRO.md)** - Guia de instalação passo a passo
- **[SQL_QUERIES_FINANCEIRO.md](./SQL_QUERIES_FINANCEIRO.md)** - Queries SQL úteis para análises

## 🎯 Casos de Uso

### 1. Registrar Despesa Diária
```typescript
await fetch('/expenses', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Anúncio Instagram',
    amount: 200.00,
    category: 'MARKETING',
    expenseDate: new Date().toISOString().split('T')[0]
  })
});
```

### 2. Ver Dashboard do Mês
```typescript
const dashboard = await fetch('/statistics/dashboard');
console.log(`Lucro Líquido: R$ ${dashboard.netProfit}`);
```

### 3. Analisar Produto Mais Lucrativo
```typescript
const profitability = await fetch('/statistics/products/profitability');
const best = profitability.sort((a, b) => b.grossProfit - a.grossProfit)[0];
console.log(`Melhor produto: ${best.productName} - R$ ${best.grossProfit}`);
```

### 4. Relatório Mensal
```typescript
const stats = await fetch(
  '/statistics/financial?startDate=2024-01-01&endDate=2024-01-31'
);
console.log(`Receita: R$ ${stats.totalRevenue}`);
console.log(`Despesas: R$ ${stats.totalExpenses}`);
console.log(`Lucro Líquido: R$ ${stats.netProfit}`);
```

## ⚡ Melhores Práticas

1. **Registre custos**: Sempre preencha o campo `cost` ao criar produtos
2. **Categorize corretamente**: Use categorias apropriadas para análises precisas
3. **Anexe comprovantes**: Use `receiptUrl` para guardar notas fiscais
4. **Análises periódicas**: Revise estatísticas mensalmente
5. **Monitore margens**: Produtos com margem < 20% podem precisar ajuste
6. **Status correto**: Use `DELIVERED` apenas para pedidos realmente entregues

## 🔄 Atualizações Necessárias

### Após Instalação

1. **Atualizar produtos existentes com custo:**
```sql
UPDATE products SET cost = price::numeric * 0.5 WHERE cost IS NULL;
```

2. **Registrar despesas históricas (opcional):**
```bash
POST /expenses com despesas retroativas
```

## 🐛 Troubleshooting

### Erro: "Column 'cost' does not exist"
**Solução:** Execute a migração
```bash
npm run migration:run
```

### Erro: "Unauthorized"
**Solução:** Verifique se o usuário tem role ADMIN
```sql
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN') WHERE email = 'seu@email.com';
```

### Dashboard retorna valores zerados
**Solução:** 
1. Verifique se há pedidos com status `DELIVERED`
2. Verifique se os produtos têm `cost` preenchido
3. Registre algumas despesas de teste

## 📈 Próximos Passos Sugeridos

- [ ] Dashboard visual no frontend
- [ ] Gráficos de tendência (receita/lucro)
- [ ] Alertas de margem baixa
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Metas de receita
- [ ] Previsões financeiras
- [ ] Integração com contabilidade
- [ ] Análise de ROI por campanha de marketing

## 🤝 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `FINANCIAL_CONTROL.md`
2. Verifique as queries SQL em `SQL_QUERIES_FINANCEIRO.md`
3. Entre em contato com a equipe de desenvolvimento

## 📝 Changelog

### v1.0.0 (Janeiro 2025)
- ✅ Módulo de despesas completo
- ✅ Campo de custo nos produtos
- ✅ Módulo de estatísticas e dashboard
- ✅ Cálculo automático de lucros
- ✅ Endpoints de relatórios
- ✅ Migração de banco de dados
- ✅ Documentação completa

---

**Versão:** 1.0.0  
**Status:** ✅ Pronto para Produção  
**Licença:** Proprietária - Realce Seu Brilho  
**Última Atualização:** Janeiro 2025
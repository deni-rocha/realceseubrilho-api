# 📊 Queries SQL Úteis - Sistema Financeiro

Este documento contém queries SQL úteis para análise financeira e troubleshooting do sistema.

## 📋 Índice

1. [Consultas Básicas](#consultas-básicas)
2. [Análise de Receitas](#análise-de-receitas)
3. [Análise de Despesas](#análise-de-despesas)
4. [Análise de Lucro](#análise-de-lucro)
5. [Produtos](#produtos)
6. [Relatórios](#relatórios)
7. [Manutenção](#manutenção)

---

## Consultas Básicas

### Verificar todas as tabelas do sistema
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Contar registros em cada tabela
```sql
SELECT 
  'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
```

---

## Análise de Receitas

### Receita total de todos os pedidos
```sql
SELECT 
  SUM(total_amount) as receita_total,
  COUNT(*) as total_pedidos,
  AVG(total_amount) as ticket_medio
FROM orders;
```

### Receita por status do pedido
```sql
SELECT 
  status,
  COUNT(*) as quantidade_pedidos,
  SUM(total_amount) as receita_total,
  AVG(total_amount) as ticket_medio
FROM orders
GROUP BY status
ORDER BY receita_total DESC;
```

### Receita apenas de pedidos entregues
```sql
SELECT 
  SUM(total_amount) as receita_entregue,
  COUNT(*) as pedidos_entregues
FROM orders
WHERE status = 'DELIVERED';
```

### Receita por mês (ano atual)
```sql
SELECT 
  EXTRACT(MONTH FROM order_date) as mes,
  TO_CHAR(order_date, 'Month') as nome_mes,
  COUNT(*) as quantidade_pedidos,
  SUM(total_amount) as receita_mensal
FROM orders
WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND status IN ('DELIVERED', 'SHIPPED')
GROUP BY EXTRACT(MONTH FROM order_date), TO_CHAR(order_date, 'Month')
ORDER BY mes;
```

### Receita por período customizado
```sql
SELECT 
  SUM(total_amount) as receita_periodo,
  COUNT(*) as pedidos_periodo
FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
  AND status = 'DELIVERED';
```

### Top 10 dias com maior receita
```sql
SELECT 
  DATE(order_date) as data,
  COUNT(*) as pedidos,
  SUM(total_amount) as receita_dia
FROM orders
WHERE status IN ('DELIVERED', 'SHIPPED')
GROUP BY DATE(order_date)
ORDER BY receita_dia DESC
LIMIT 10;
```

---

## Análise de Despesas

### Total de despesas
```sql
SELECT 
  SUM(amount) as total_despesas,
  COUNT(*) as quantidade_despesas
FROM expenses;
```

### Despesas por categoria
```sql
SELECT 
  category as categoria,
  COUNT(*) as quantidade,
  SUM(amount) as total,
  AVG(amount) as media,
  MIN(amount) as minimo,
  MAX(amount) as maximo
FROM expenses
GROUP BY category
ORDER BY total DESC;
```

### Despesas por mês
```sql
SELECT 
  EXTRACT(YEAR FROM expense_date) as ano,
  EXTRACT(MONTH FROM expense_date) as mes,
  TO_CHAR(expense_date, 'Month YYYY') as periodo,
  SUM(amount) as total_despesas
FROM expenses
GROUP BY EXTRACT(YEAR FROM expense_date), EXTRACT(MONTH FROM expense_date), TO_CHAR(expense_date, 'Month YYYY')
ORDER BY ano DESC, mes DESC;
```

### Despesas do último mês
```sql
SELECT 
  description,
  amount,
  category,
  expense_date
FROM expenses
WHERE expense_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND expense_date < DATE_TRUNC('month', CURRENT_DATE)
ORDER BY expense_date DESC;
```

### Top 10 maiores despesas
```sql
SELECT 
  description,
  amount,
  category,
  expense_date,
  TO_CHAR(expense_date, 'DD/MM/YYYY') as data_formatada
FROM expenses
ORDER BY amount DESC
LIMIT 10;
```

### Despesas por usuário (quem cadastrou)
```sql
SELECT 
  u.name as usuario,
  COUNT(e.id) as quantidade_despesas,
  SUM(e.amount) as total_registrado
FROM expenses e
LEFT JOIN users u ON e.created_by_user_id = u.id
GROUP BY u.name
ORDER BY total_registrado DESC;
```

---

## Análise de Lucro

### Lucro bruto (receita - custo dos produtos)
```sql
SELECT 
  SUM(o.total_amount) as receita_total,
  SUM(oi.quantity * COALESCE(p.cost, 0)) as custo_total,
  SUM(o.total_amount) - SUM(oi.quantity * COALESCE(p.cost, 0)) as lucro_bruto,
  ROUND(
    ((SUM(o.total_amount) - SUM(oi.quantity * COALESCE(p.cost, 0))) / NULLIF(SUM(o.total_amount), 0) * 100)::numeric, 
    2
  ) as margem_lucro_bruto_percentual
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'DELIVERED';
```

### Lucro líquido (lucro bruto - despesas)
```sql
WITH receita_custo AS (
  SELECT 
    SUM(o.total_amount) as receita,
    SUM(oi.quantity * COALESCE(p.cost, 0)) as custo
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  WHERE o.status = 'DELIVERED'
),
despesas AS (
  SELECT SUM(amount) as total_despesas
  FROM expenses
)
SELECT 
  receita,
  custo,
  (receita - custo) as lucro_bruto,
  total_despesas,
  (receita - custo - total_despesas) as lucro_liquido,
  ROUND(
    (((receita - custo - total_despesas) / NULLIF(receita, 0)) * 100)::numeric, 
    2
  ) as margem_liquida_percentual
FROM receita_custo, despesas;
```

### Lucro por mês
```sql
WITH receita_mensal AS (
  SELECT 
    EXTRACT(YEAR FROM o.order_date) as ano,
    EXTRACT(MONTH FROM o.order_date) as mes,
    SUM(o.total_amount) as receita,
    SUM(oi.quantity * COALESCE(p.cost, 0)) as custo
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  WHERE o.status = 'DELIVERED'
  GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date)
),
despesas_mensal AS (
  SELECT 
    EXTRACT(YEAR FROM expense_date) as ano,
    EXTRACT(MONTH FROM expense_date) as mes,
    SUM(amount) as despesas
  FROM expenses
  GROUP BY EXTRACT(YEAR FROM expense_date), EXTRACT(MONTH FROM expense_date)
)
SELECT 
  rm.ano,
  rm.mes,
  TO_CHAR(TO_DATE(rm.mes::text, 'MM'), 'Month') as nome_mes,
  rm.receita,
  rm.custo,
  COALESCE(dm.despesas, 0) as despesas,
  (rm.receita - rm.custo) as lucro_bruto,
  (rm.receita - rm.custo - COALESCE(dm.despesas, 0)) as lucro_liquido
FROM receita_mensal rm
LEFT JOIN despesas_mensal dm ON rm.ano = dm.ano AND rm.mes = dm.mes
ORDER BY rm.ano DESC, rm.mes DESC;
```

---

## Produtos

### Produtos mais vendidos
```sql
SELECT 
  p.id,
  p.name,
  SUM(oi.quantity) as quantidade_vendida,
  SUM(oi.subtotal) as receita_total,
  COUNT(DISTINCT oi.order_id) as numero_pedidos
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'DELIVERED'
GROUP BY p.id, p.name
ORDER BY quantidade_vendida DESC
LIMIT 10;
```

### Produtos com melhor margem de lucro
```sql
SELECT 
  p.id,
  p.name,
  p.price,
  p.cost,
  (CAST(p.price AS NUMERIC) - COALESCE(p.cost, 0)) as lucro_unitario,
  ROUND(
    (((CAST(p.price AS NUMERIC) - COALESCE(p.cost, 0)) / NULLIF(CAST(p.price AS NUMERIC), 0)) * 100)::numeric,
    2
  ) as margem_percentual,
  SUM(oi.quantity) as quantidade_vendida
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'DELIVERED'
WHERE p.cost IS NOT NULL AND p.cost > 0
GROUP BY p.id, p.name, p.price, p.cost
ORDER BY margem_percentual DESC;
```

### Produtos sem custo definido
```sql
SELECT 
  id,
  name,
  price,
  cost,
  stock_quantity
FROM products
WHERE cost IS NULL OR cost = 0
ORDER BY name;
```

### Produtos com estoque baixo ou zerado
```sql
SELECT 
  id,
  name,
  price,
  stock_quantity,
  CASE 
    WHEN stock_quantity = 0 THEN 'SEM ESTOQUE'
    WHEN stock_quantity <= 5 THEN 'ESTOQUE CRÍTICO'
    WHEN stock_quantity <= 10 THEN 'ESTOQUE BAIXO'
  END as status_estoque
FROM products
WHERE stock_quantity <= 10
ORDER BY stock_quantity ASC;
```

### Lucratividade por produto (completo)
```sql
SELECT 
  p.id,
  p.name,
  p.price as preco_venda,
  p.cost as custo,
  (CAST(p.price AS NUMERIC) - COALESCE(p.cost, 0)) as margem_unitaria,
  SUM(oi.quantity) as quantidade_vendida,
  SUM(oi.subtotal) as receita_total,
  SUM(oi.quantity * COALESCE(p.cost, 0)) as custo_total,
  (SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost, 0))) as lucro_total,
  ROUND(
    (((SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost, 0))) / NULLIF(SUM(oi.subtotal), 0)) * 100)::numeric,
    2
  ) as margem_percentual
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('DELIVERED', 'SHIPPED')
GROUP BY p.id, p.name, p.price, p.cost
ORDER BY lucro_total DESC;
```

---

## Relatórios

### Dashboard resumido
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as total_usuarios,
  (SELECT COUNT(*) FROM products) as total_produtos,
  (SELECT COUNT(*) FROM orders) as total_pedidos,
  (SELECT SUM(total_amount) FROM orders WHERE status = 'DELIVERED') as receita_total,
  (SELECT SUM(amount) FROM expenses) as despesas_totais,
  (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pedidos_pendentes,
  (SELECT COUNT(*) FROM products WHERE stock_quantity = 0) as produtos_sem_estoque;
```

### Relatório financeiro completo do mês atual
```sql
WITH mes_atual AS (
  SELECT 
    DATE_TRUNC('month', CURRENT_DATE) as inicio_mes,
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as fim_mes
),
receitas AS (
  SELECT 
    COUNT(*) as total_pedidos,
    SUM(o.total_amount) as receita,
    SUM(oi.quantity * COALESCE(p.cost, 0)) as custo
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  CROSS JOIN mes_atual
  WHERE o.order_date >= mes_atual.inicio_mes 
    AND o.order_date <= mes_atual.fim_mes
    AND o.status = 'DELIVERED'
),
despesas AS (
  SELECT 
    COUNT(*) as total_despesas,
    SUM(amount) as valor_despesas
  FROM expenses
  CROSS JOIN mes_atual
  WHERE expense_date >= mes_atual.inicio_mes::date
    AND expense_date <= mes_atual.fim_mes::date
)
SELECT 
  TO_CHAR(inicio_mes, 'Month YYYY') as periodo,
  r.total_pedidos,
  r.receita,
  r.custo,
  (r.receita - r.custo) as lucro_bruto,
  d.total_despesas,
  d.valor_despesas,
  (r.receita - r.custo - d.valor_despesas) as lucro_liquido,
  ROUND(
    (((r.receita - r.custo) / NULLIF(r.receita, 0)) * 100)::numeric,
    2
  ) as margem_bruta_percent,
  ROUND(
    (((r.receita - r.custo - d.valor_despesas) / NULLIF(r.receita, 0)) * 100)::numeric,
    2
  ) as margem_liquida_percent
FROM mes_atual, receitas r, despesas d;
```

### Comparação ano a ano
```sql
SELECT 
  EXTRACT(YEAR FROM order_date) as ano,
  COUNT(*) as total_pedidos,
  SUM(total_amount) as receita_anual,
  AVG(total_amount) as ticket_medio
FROM orders
WHERE status = 'DELIVERED'
GROUP BY EXTRACT(YEAR FROM order_date)
ORDER BY ano DESC;
```

---

## Manutenção

### Atualizar custo de todos os produtos (50% do preço)
```sql
UPDATE products 
SET cost = CAST(price AS NUMERIC) * 0.5
WHERE cost IS NULL OR cost = 0;
```

### Atualizar custo de um produto específico
```sql
UPDATE products 
SET cost = 25.50
WHERE id = 'uuid-do-produto';
```

### Deletar despesas de teste
```sql
DELETE FROM expenses 
WHERE description LIKE '%teste%' 
  OR description LIKE '%Teste%';
```

### Verificar integridade dos dados
```sql
-- Pedidos sem itens
SELECT o.id, o.order_date, o.total_amount
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE oi.id IS NULL;

-- Produtos sem preço
SELECT id, name, price, cost
FROM products
WHERE price IS NULL OR CAST(price AS NUMERIC) = 0;

-- Despesas com valores zerados
SELECT id, description, amount, category
FROM expenses
WHERE amount = 0;
```

### Backup das tabelas financeiras
```sql
-- Criar backup da tabela expenses
CREATE TABLE expenses_backup AS 
SELECT * FROM expenses;

-- Criar backup da tabela orders
CREATE TABLE orders_backup AS 
SELECT * FROM orders;
```

### Limpar dados de teste (CUIDADO!)
```sql
-- ATENÇÃO: Use com cuidado, isso deleta dados!

-- Deletar pedidos de teste
DELETE FROM orders 
WHERE guest_name LIKE '%teste%' 
  OR guest_name LIKE '%Teste%';

-- Deletar produtos de teste
DELETE FROM products 
WHERE name LIKE '%teste%' 
  OR name LIKE '%Teste%';
```

---

## 📈 Queries Avançadas

### ROI por categoria de despesa
```sql
WITH despesas_marketing AS (
  SELECT SUM(amount) as gasto_marketing
  FROM expenses
  WHERE category = 'MARKETING'
    AND expense_date >= DATE_TRUNC('year', CURRENT_DATE)
),
receita_ano AS (
  SELECT SUM(total_amount) as receita
  FROM orders
  WHERE status = 'DELIVERED'
    AND order_date >= DATE_TRUNC('year', CURRENT_DATE)
)
SELECT 
  gasto_marketing,
  receita,
  ROUND(
    ((receita - gasto_marketing) / NULLIF(gasto_marketing, 0) * 100)::numeric,
    2
  ) as roi_percentual
FROM despesas_marketing, receita_ano;
```

### Clientes com maior ticket médio
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as total_pedidos,
  SUM(o.total_amount) as receita_total,
  AVG(o.total_amount) as ticket_medio
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'DELIVERED'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) >= 2
ORDER BY ticket_medio DESC
LIMIT 20;
```

### Taxa de conversão por período
```sql
SELECT 
  DATE_TRUNC('month', order_date) as mes,
  COUNT(*) as total_pedidos,
  SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as pedidos_entregues,
  SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as pedidos_cancelados,
  ROUND(
    (SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100)::numeric,
    2
  ) as taxa_conclusao
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY mes DESC;
```

---

## 💡 Dicas

1. **Performance**: Use índices nas colunas frequentemente consultadas (order_date, status, expense_date, category)
2. **Datas**: Use sempre `DATE_TRUNC` para agrupar por período
3. **NULL Safety**: Use `COALESCE` para tratar valores nulos em cálculos
4. **Formatação**: Use `TO_CHAR` para formatar datas e números
5. **CTEs**: Use Common Table Expressions (WITH) para queries complexas mais legíveis

---

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Compatibilidade:** PostgreSQL 12+
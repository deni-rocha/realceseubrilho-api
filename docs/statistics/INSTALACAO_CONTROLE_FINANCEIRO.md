# 🚀 Instalação do Sistema de Controle Financeiro

Este guia contém instruções passo a passo para instalar e configurar o novo sistema de controle financeiro na API Realce Seu Brilho.

## 📋 Pré-requisitos

- Node.js instalado (v16 ou superior)
- PostgreSQL rodando
- Projeto já configurado e funcionando
- Acesso ao banco de dados

## 🔧 Passo 1: Instalar Dependências

As dependências necessárias já devem estar instaladas no projeto. Caso precise reinstalar:

```bash
cd realceseubrilho-api
npm install
```

## 🗄️ Passo 2: Executar Migração do Banco de Dados

Execute a migração para criar as novas tabelas e colunas:

```bash
npm run migration:run
```

Esta migração irá:
- ✅ Adicionar coluna `cost` (custo) na tabela `products`
- ✅ Criar tabela `expenses` (despesas)
- ✅ Criar todas as relações necessárias

### Verificar se a migração foi executada

```bash
npm run migration:show
```

Você deverá ver `AddExpensesAndProductCost` marcada como executada.

## 🔄 Passo 3: Reiniciar a API

Após executar a migração, reinicie o servidor:

```bash
npm run start:dev
```

Ou em produção:

```bash
npm run build
npm run start:prod
```

## ✅ Passo 4: Verificar Instalação

### Teste 1: Verificar Endpoints

Com o servidor rodando, acesse:

```bash
# Verificar health da API
curl http://localhost:3000/

# Verificar endpoint de dashboard (requer autenticação admin)
curl -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  http://localhost:3000/statistics/dashboard
```

### Teste 2: Criar uma Despesa de Teste

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "description": "Teste de instalação",
    "amount": 100.00,
    "category": "OTHER",
    "expenseDate": "2024-01-15"
  }'
```

### Teste 3: Verificar Dashboard

```bash
curl -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  http://localhost:3000/statistics/dashboard
```

Resposta esperada:
```json
{
  "totalUsers": 0,
  "totalProducts": 0,
  "totalOrders": 0,
  "totalRevenue": 0,
  "totalExpenses": 100.00,
  "totalCost": 0,
  "grossProfit": 0,
  "netProfit": -100.00,
  ...
}
```

## 📊 Passo 5: Atualizar Produtos Existentes

Adicione o custo aos produtos existentes para cálculos precisos de lucro:

### Opção 1: Via API (Recomendado)

```bash
# Atualizar um produto por vez
curl -X PATCH http://localhost:3000/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "cost": 25.50
  }'
```

### Opção 2: Via SQL (Para atualização em massa)

```sql
-- Definir custo padrão para produtos sem custo
UPDATE products SET cost = 0 WHERE cost IS NULL;

-- Ou definir custo como 50% do preço de venda (exemplo)
UPDATE products 
SET cost = CAST(price AS NUMERIC) * 0.5 
WHERE cost IS NULL OR cost = 0;
```

## 🎯 Passo 6: Configuração Inicial

### 6.1 Criar Categorias de Despesas Iniciais

Registre despesas retroativas se necessário:

```bash
# Despesa de marketing
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "description": "Google Ads - Janeiro",
    "amount": 500.00,
    "category": "MARKETING",
    "expenseDate": "2024-01-01"
  }'

# Despesa operacional
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "description": "Aluguel - Janeiro",
    "amount": 1500.00,
    "category": "OPERATIONAL",
    "expenseDate": "2024-01-01"
  }'
```

### 6.2 Definir Custos dos Produtos

Atualize cada produto com seu custo real:

```javascript
// Exemplo de script Node.js
const products = [
  { id: 'uuid-1', name: 'Brinco Dourado', cost: 25.00 },
  { id: 'uuid-2', name: 'Colar Prata', cost: 45.00 },
  // ... outros produtos
];

for (const product of products) {
  await fetch(`http://localhost:3000/products/${product.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ cost: product.cost })
  });
}
```

## 🔐 Passo 7: Configurar Permissões

Os endpoints de despesas e estatísticas requerem role **ADMIN**.

Verifique se o usuário admin tem a role correta:

```sql
-- Verificar roles
SELECT u.email, r.name as role 
FROM users u 
JOIN roles r ON u.role_id = r.id;

-- Atualizar usuário para ADMIN se necessário
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
WHERE email = 'admin@example.com';
```

## 📱 Passo 8: Integração com Frontend (Opcional)

Se você tem um frontend, atualize-o para usar os novos endpoints:

### Exemplo de Hook React

```typescript
// useFinancialStats.ts
export function useFinancialStats() {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/statistics/dashboard').then(r => r.json())
  });

  const { data: financial } = useQuery({
    queryKey: ['financial-stats'],
    queryFn: () => fetch('/statistics/financial').then(r => r.json())
  });

  return { dashboard, financial };
}
```

### Exemplo de Componente Dashboard

```tsx
function FinancialDashboard() {
  const { dashboard } = useFinancialStats();

  return (
    <div>
      <StatCard 
        title="Receita Total" 
        value={dashboard?.totalRevenue} 
      />
      <StatCard 
        title="Lucro Líquido" 
        value={dashboard?.netProfit} 
      />
      <StatCard 
        title="Total de Despesas" 
        value={dashboard?.totalExpenses} 
      />
    </div>
  );
}
```

## 🧪 Passo 9: Testes

Execute os testes para garantir que tudo está funcionando:

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e
```

## 📚 Passo 10: Documentação

Consulte os seguintes arquivos para mais informações:

- `FINANCIAL_CONTROL.md` - Documentação completa do sistema
- `src/expense/` - Código fonte do módulo de despesas
- `src/statistics/` - Código fonte do módulo de estatísticas

## 🐛 Solução de Problemas

### Erro: "Migration already executed"

Se a migração já foi executada, você pode reverter e executar novamente:

```bash
npm run migration:revert
npm run migration:run
```

### Erro: "Column 'cost' does not exist"

A migração não foi executada corretamente. Execute:

```bash
npm run migration:run
```

### Erro: "Unauthorized" ao acessar endpoints

Certifique-se de:
1. Estar autenticado
2. O token JWT é válido
3. O usuário tem role ADMIN

### Erro: "Cannot find module '@/expense/expense.module'"

Reconstrua o projeto:

```bash
npm run build
```

## 📊 Dados de Exemplo

Para popular o sistema com dados de teste:

```bash
# Script SQL para criar despesas de exemplo
INSERT INTO expenses (id, description, amount, category, expense_date, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), 'Compra de estoque', 5000.00, 'INVENTORY', '2024-01-05', NOW(), NOW()),
  (uuid_generate_v4(), 'Anúncios Facebook', 800.00, 'MARKETING', '2024-01-10', NOW(), NOW()),
  (uuid_generate_v4(), 'Embalagens personalizadas', 450.00, 'PACKAGING', '2024-01-12', NOW(), NOW()),
  (uuid_generate_v4(), 'Internet + Hospedagem', 150.00, 'SOFTWARE', '2024-01-15', NOW(), NOW());
```

## ✅ Checklist de Instalação

- [ ] Dependências instaladas
- [ ] Migração executada com sucesso
- [ ] API reiniciada
- [ ] Endpoints testados
- [ ] Despesa de teste criada
- [ ] Dashboard acessível
- [ ] Produtos atualizados com custo
- [ ] Permissões configuradas
- [ ] Documentação lida
- [ ] Testes executados

## 🎉 Conclusão

Parabéns! O sistema de controle financeiro está instalado e pronto para uso.

### Próximos Passos:

1. ✅ Registrar despesas regularmente
2. ✅ Manter custos dos produtos atualizados
3. ✅ Monitorar dashboard semanalmente
4. ✅ Analisar relatórios mensalmente
5. ✅ Ajustar preços baseado na margem de lucro

### Recursos Úteis:

- 📖 Documentação completa: `FINANCIAL_CONTROL.md`
- 🔌 Collection do Postman: `Realce Seu Brilho API.postman_collection.json`
- 💬 Suporte: Entre em contato com a equipe de desenvolvimento

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Status:** ✅ Pronto para produção
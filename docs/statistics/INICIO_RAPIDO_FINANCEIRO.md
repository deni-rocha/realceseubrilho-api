# ⚡ Início Rápido - Sistema Financeiro

Guia de 5 minutos para começar a usar o sistema de controle financeiro.

## 🚀 Instalação (3 minutos)

### Passo 1: Executar Migração
```bash
cd realceseubrilho-api
npm run migration:run
```

### Passo 2: Reiniciar Servidor
```bash
npm run start:dev
```

### Passo 3: Testar
```bash
# Obter token admin (faça login com usuário admin)
TOKEN="seu_token_jwt_aqui"

# Testar dashboard
curl http://localhost:3000/statistics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

✅ Se receber um JSON com estatísticas, está funcionando!

---

## 📝 Uso Básico (2 minutos)

### 1. Adicionar Custo nos Produtos

Atualize seus produtos para incluir o custo:

```bash
curl -X PATCH http://localhost:3000/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "cost": 25.50
  }'
```

**Dica:** O custo geralmente é 40-60% do preço de venda.

### 2. Registrar uma Despesa

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Anúncios Facebook - Janeiro",
    "amount": 500.00,
    "category": "MARKETING",
    "expenseDate": "2024-01-15"
  }'
```

### 3. Ver Estatísticas

```bash
curl http://localhost:3000/statistics/financial \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Categorias de Despesas

Use estas categorias ao registrar despesas:

- `INVENTORY` - Compra de produtos
- `MARKETING` - Publicidade
- `SHIPPING` - Frete
- `PACKAGING` - Embalagens
- `OPERATIONAL` - Aluguel, luz, água
- `SALARY` - Salários
- `TAXES` - Impostos
- `MAINTENANCE` - Manutenção
- `SOFTWARE` - Software/SaaS
- `OTHER` - Outras

---

## 🎯 Endpoints Essenciais

### Dashboard Geral
```
GET /statistics/dashboard
```
Retorna: Receita, Despesas, Lucro, Pedidos, Estoque

### Análise Financeira
```
GET /statistics/financial?startDate=2024-01-01&endDate=2024-12-31
```
Retorna: Análise completa com margens de lucro

### Criar Despesa
```
POST /expenses
Body: { description, amount, category, expenseDate }
```

### Listar Despesas
```
GET /expenses
```

### Despesas por Categoria
```
GET /expenses/summary/by-category
```

### Produtos Mais Lucrativos
```
GET /statistics/products/profitability
```

### Receita Mensal
```
GET /statistics/revenue/monthly?year=2024
```

---

## 💡 Exemplos Práticos

### Registrar Despesa de Marketing
```json
POST /expenses
{
  "description": "Google Ads - Campanha Verão",
  "amount": 800.00,
  "category": "MARKETING",
  "expenseDate": "2024-01-20"
}
```

### Registrar Compra de Estoque
```json
POST /expenses
{
  "description": "Compra de brincos fornecedor XYZ",
  "amount": 2500.00,
  "category": "INVENTORY",
  "expenseDate": "2024-01-18",
  "notes": "50 unidades - Nota Fiscal #12345"
}
```

### Atualizar Custo de Produto
```json
PATCH /products/abc-123
{
  "cost": 35.00
}
```

---

## 📈 Fluxo de Trabalho Recomendado

### Diário
1. Registrar despesas do dia
2. Verificar pedidos pendentes

### Semanal
1. Revisar dashboard
2. Verificar estoque baixo
3. Analisar despesas da semana

### Mensal
1. Gerar relatório mensal (`/statistics/financial`)
2. Analisar produtos mais lucrativos
3. Comparar receita vs despesas
4. Ajustar preços se necessário
5. Planejar próximo mês

---

## 🔍 Verificações Importantes

### ✅ Antes de Começar

- [ ] Migração executada com sucesso
- [ ] Servidor reiniciado
- [ ] Usuário tem role ADMIN
- [ ] Token JWT válido

### ✅ Para Dados Precisos

- [ ] Todos os produtos têm `cost` definido
- [ ] Despesas registradas corretamente
- [ ] Categorias usadas apropriadamente
- [ ] Status dos pedidos correto (DELIVERED para entregues)

---

## 🆘 Problemas Comuns

### "Column 'cost' does not exist"
```bash
npm run migration:run
```

### "Unauthorized"
Verifique se o usuário é ADMIN:
```sql
SELECT u.email, r.name FROM users u JOIN roles r ON u.role_id = r.id;
```

### Dashboard com valores zerados
1. Crie alguns pedidos de teste com status DELIVERED
2. Adicione custo aos produtos
3. Registre algumas despesas

---

## 📚 Quer Saber Mais?

- **Documentação Completa:** `FINANCIAL_CONTROL.md`
- **Guia de Instalação:** `INSTALACAO_CONTROLE_FINANCEIRO.md`
- **Queries SQL Úteis:** `SQL_QUERIES_FINANCEIRO.md`
- **Resumo do Sistema:** `README_SISTEMA_FINANCEIRO.md`

---

## 🎉 Próximos Passos

1. ✅ Adicione custo em todos os produtos
2. ✅ Registre despesas dos últimos 30 dias
3. ✅ Verifique o dashboard
4. ✅ Analise produtos mais lucrativos
5. ✅ Configure rotina de análise semanal

---

## 📞 Suporte

Dúvidas? Consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

**Versão:** 1.0.0  
**Tempo de Setup:** ~5 minutos  
**Status:** ✅ Pronto para Uso
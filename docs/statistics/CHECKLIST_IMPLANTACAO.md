# ✅ Checklist de Implantação - Sistema de Controle Financeiro

Use este checklist para garantir que todos os passos da implantação sejam executados corretamente.

---

## 📋 Pré-Implantação

### Verificação do Ambiente

- [ ] Node.js v16+ instalado
- [ ] PostgreSQL rodando e acessível
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Backup do banco de dados criado
- [ ] Acesso de admin disponível para testes

### Verificação do Código

- [ ] Branch main/develop atualizada
- [ ] Código compilando sem erros (`npm run build`)
- [ ] Nenhum erro no ESLint
- [ ] TypeScript sem erros de tipo

---

## 🗄️ Migração do Banco de Dados

### Antes de Migrar

- [ ] Backup completo do banco criado
- [ ] Script de rollback testado em ambiente de desenvolvimento
- [ ] Revisar migration: `src/database/migrations/1762900000000-AddExpensesAndProductCost.ts`

### Executar Migração

```bash
# Verificar migrações pendentes
npm run migration:show

# Executar migração
npm run migration:run

# Verificar se foi aplicada
npm run migration:show
```

- [ ] Migração executada com sucesso
- [ ] Tabela `expenses` criada
- [ ] Coluna `cost` adicionada em `products`
- [ ] Foreign keys criadas corretamente

### Validar Banco de Dados

```sql
-- Verificar tabela expenses
SELECT * FROM expenses LIMIT 1;

-- Verificar coluna cost em products
SELECT id, name, price, cost FROM products LIMIT 5;

-- Verificar constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name IN ('expenses', 'products');
```

- [ ] Tabela `expenses` existe e está acessível
- [ ] Coluna `cost` existe em `products`
- [ ] Foreign keys funcionando

---

## 🚀 Deploy da Aplicação

### Build

```bash
# Limpar build anterior
rm -rf dist/

# Build production
npm run build

# Verificar dist/
ls -la dist/
```

- [ ] Build executado sem erros
- [ ] Pasta `dist/` criada com sucesso
- [ ] Todos os módulos presentes em dist/

### Reiniciar Servidor

```bash
# Parar servidor atual
pm2 stop realceseubrilho-api

# Iniciar com novo código
pm2 start dist/main.js --name realceseubrilho-api

# Verificar logs
pm2 logs realceseubrilho-api
```

- [ ] Servidor iniciado sem erros
- [ ] Logs não mostram erros críticos
- [ ] API respondendo em `/` (health check)

---

## 🧪 Testes de Validação

### 1. Health Check

```bash
curl http://localhost:3000/
```

- [ ] API respondendo corretamente
- [ ] Status 200 retornado

### 2. Dashboard Endpoint

```bash
TOKEN="seu_token_admin_aqui"

curl http://localhost:3000/statistics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Endpoint `/statistics/dashboard` funcionando
- [ ] JSON retornado com estrutura correta
- [ ] Valores numéricos válidos (não NaN ou undefined)

### 3. Criar Despesa de Teste

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Teste de implantação",
    "amount": 1.00,
    "category": "OTHER",
    "expenseDate": "'$(date +%Y-%m-%d)'"
  }'
```

- [ ] Despesa criada com sucesso
- [ ] ID retornado
- [ ] Dados salvos corretamente no banco

### 4. Listar Despesas

```bash
curl http://localhost:3000/expenses \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Lista retornada com sucesso
- [ ] Despesa de teste aparece na lista
- [ ] Formato correto dos dados

### 5. Atualizar Produto com Custo

```bash
# Buscar ID de um produto
PRODUCT_ID="id_de_um_produto"

curl -X PATCH http://localhost:3000/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "cost": 25.00
  }'
```

- [ ] Produto atualizado com sucesso
- [ ] Campo `cost` salvo corretamente
- [ ] Produto pode ser recuperado com o custo

### 6. Estatísticas Financeiras

```bash
curl http://localhost:3000/statistics/financial \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Endpoint funcionando
- [ ] Cálculos corretos (receita, custo, lucro)
- [ ] Margens de lucro calculadas

### 7. Produtos Mais Lucrativos

```bash
curl http://localhost:3000/statistics/products/profitability \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Lista de produtos retornada
- [ ] Cálculos de lucratividade corretos
- [ ] Ordenação funcionando

### 8. Receita Mensal

```bash
curl http://localhost:3000/statistics/revenue/monthly?year=2024 \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Array com 12 meses retornado
- [ ] Dados agregados por mês
- [ ] Valores corretos

---

## 🔐 Segurança

### Verificar Autenticação

```bash
# Tentar acessar sem token (deve falhar)
curl http://localhost:3000/statistics/dashboard
```

- [ ] Acesso negado sem autenticação (401)
- [ ] Endpoints protegidos corretamente

### Verificar Autorização

```bash
# Tentar acessar com usuário não-admin (deve falhar)
curl http://localhost:3000/expenses \
  -H "Authorization: Bearer TOKEN_NAO_ADMIN"
```

- [ ] Acesso negado para não-admin (403)
- [ ] Role ADMIN necessária

### Validação de Dados

```bash
# Tentar criar despesa inválida
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "",
    "amount": -100,
    "category": "INVALID"
  }'
```

- [ ] Validação funcionando
- [ ] Erros apropriados retornados (400)
- [ ] Mensagens de erro claras

---

## 📊 Dados Iniciais

### Atualizar Produtos Existentes

- [ ] Script preparado para atualizar custos
- [ ] Custos definidos para cada produto
- [ ] Produtos atualizados via API ou SQL

### Registrar Despesas Históricas (Opcional)

- [ ] Despesas dos últimos 3 meses registradas
- [ ] Categorias corretas utilizadas
- [ ] Datas corretas

---

## 📝 Documentação

### Acessibilidade

- [ ] `FINANCIAL_CONTROL.md` acessível
- [ ] `INSTALACAO_CONTROLE_FINANCEIRO.md` acessível
- [ ] `SQL_QUERIES_FINANCEIRO.md` acessível
- [ ] `README_SISTEMA_FINANCEIRO.md` acessível
- [ ] `INICIO_RAPIDO_FINANCEIRO.md` acessível
- [ ] `RESUMO_IMPLEMENTACAO.md` acessível

### Treinamento da Equipe

- [ ] Equipe instruída sobre novos endpoints
- [ ] Exemplos de uso demonstrados
- [ ] Dúvidas esclarecidas

---

## 🔍 Monitoramento

### Logs

```bash
# Verificar logs de erro
pm2 logs realceseubrilho-api --err

# Verificar logs gerais
pm2 logs realceseubrilho-api
```

- [ ] Nenhum erro crítico nos logs
- [ ] Warnings revisados e documentados
- [ ] Performance aceitável

### Performance

- [ ] Endpoints respondendo em < 1s
- [ ] Queries de banco otimizadas
- [ ] Sem memory leaks observados

### Banco de Dados

```sql
-- Verificar tamanho das novas tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('expenses', 'products', 'orders')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

- [ ] Tamanhos de tabelas razoáveis
- [ ] Índices criados automaticamente
- [ ] Performance de queries aceitável

---

## 🚨 Rollback (Se Necessário)

### Preparação

```bash
# Reverter migração
npm run migration:revert

# Reverter código
git checkout <commit-anterior>

# Rebuild
npm run build

# Restart
pm2 restart realceseubrilho-api
```

### Checklist de Rollback

- [ ] Backup do banco restaurado
- [ ] Código anterior deployado
- [ ] Servidor reiniciado
- [ ] API funcionando normalmente
- [ ] Incident documentado

---

## ✅ Pós-Implantação

### Validação Final

- [ ] Todos os testes passando
- [ ] API estável por 1 hora
- [ ] Nenhum erro crítico reportado
- [ ] Dashboard retornando dados corretos

### Comunicação

- [ ] Equipe notificada do deploy
- [ ] Changelog atualizado
- [ ] Stakeholders informados
- [ ] Documentação compartilhada

### Próximos Passos

- [ ] Agendar revisão em 1 semana
- [ ] Planejar melhorias futuras
- [ ] Coletar feedback da equipe
- [ ] Monitorar uso dos novos endpoints

---

## 📞 Contatos de Emergência

**Desenvolvedor Responsável:** [Seu Nome]  
**Email:** [seu@email.com]  
**Telefone:** [seu telefone]

**DBA:** [Nome do DBA]  
**Email:** [dba@email.com]

**DevOps:** [Nome DevOps]  
**Email:** [devops@email.com]

---

## 📊 Métricas de Sucesso

### KPIs para Monitorar

- [ ] Tempo de resposta dos endpoints < 1s
- [ ] Taxa de erro < 1%
- [ ] Uptime > 99.9%
- [ ] Uso de CPU/Memória estável

### Adoção

- [ ] Número de despesas registradas/semana
- [ ] Frequência de acesso ao dashboard
- [ ] Produtos com custo definido (meta: 100%)

---

## 🎉 Conclusão

- [ ] Todos os itens críticos marcados
- [ ] Sistema funcionando em produção
- [ ] Equipe treinada
- [ ] Monitoramento ativo
- [ ] Documentação completa

**Data de Implantação:** ___/___/_____  
**Responsável:** ______________________  
**Status Final:** [ ] Sucesso  [ ] Com pendências  [ ] Requer rollback

---

**Versão do Checklist:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Compatibilidade:** Sistema Financeiro v1.0.0
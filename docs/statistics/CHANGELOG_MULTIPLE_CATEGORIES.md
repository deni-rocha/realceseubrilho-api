# Changelog - Múltiplas Categorias por Produto

## Data: 10 de novembro de 2024

## Resumo
Implementação da funcionalidade que permite que um produto tenha múltiplas categorias, transformando o relacionamento de **ManyToOne** para **ManyToMany** entre produtos e categorias.

---

## Alterações no Banco de Dados

### Migration: `1762784687314-ProductCategoryManyToMany.ts`

**O que foi feito:**
- Criação da tabela de relacionamento `product_categories_relation`
- Migração automática dos dados existentes da coluna `category_id` para a nova tabela
- Remoção da coluna `category_id` da tabela `products`
- Adição de índices e foreign keys apropriadas

**Estrutura da nova tabela:**
```sql
CREATE TABLE "product_categories_relation" (
  "product_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  PRIMARY KEY ("product_id", "category_id")
);
```

**Reversão:**
A migration possui um método `down()` que reverte todas as alterações, restaurando a estrutura anterior (mantém apenas a primeira categoria de cada produto).

---

## Alterações nas Entidades

### `Product` Entity (`src/product/entities/product.entity.ts`)

**Antes:**
```typescript
@ManyToOne(() => ProductCategory, (category) => category.products, {
  nullable: true,
  onDelete: 'SET NULL',
})
@JoinColumn({ name: 'category_id' })
category: ProductCategory;
```

**Depois:**
```typescript
@ManyToMany(() => ProductCategory, (category) => category.products, {
  cascade: true,
})
@JoinTable({
  name: 'product_categories_relation',
  joinColumn: {
    name: 'product_id',
    referencedColumnName: 'id',
  },
  inverseJoinColumn: {
    name: 'category_id',
    referencedColumnName: 'id',
  },
})
categories: ProductCategory[];
```

### `ProductCategory` Entity (`src/product-category/entities/product-category.entity.ts`)

**Antes:**
```typescript
@OneToMany(() => Product, (product) => product.category)
products: Product[];
```

**Depois:**
```typescript
@ManyToMany(() => Product, (product) => product.categories)
products: Product[];
```

---

## Alterações nos DTOs

### `CreateProductDto` (`src/product/dto/create-product.dto.ts`)

**Antes:**
```typescript
@IsUUID()
@IsOptional()
categoryId?: string;
```

**Depois:**
```typescript
@IsArray()
@IsUUID('4', { each: true })
@IsOptional()
categoryIds?: string[];
```

### `UpdateProductDto`
Herda automaticamente as mudanças do `CreateProductDto` através do `PartialType`.

---

## Alterações no Service

### `ProductService` (`src/product/product.service.ts`)

**Método `create()`:**
- Agora aceita um array de `categoryIds`
- Valida cada categoria individualmente
- Atribui todas as categorias ao produto

**Método `findAll()` e `findOne()`:**
- Atualizado para carregar o relacionamento `categories` ao invés de `category`

**Método `update()`:**
- Permite atualizar as categorias do produto com um array de IDs
- Remove a propriedade `categoryIds` antes de aplicar outras atualizações

**Método `calculateTotal()`:**
- Removido `async` (não havia operações assíncronas)

---

## Alterações na API (Postman Collection)

### Endpoint: `POST /products` (Criar Produto)

**Request Body - Antes:**
```json
{
  "name": "batom Rose",
  "description": "batom de cor rose",
  "stockQuantity": 8,
  "price": 15,
  "categoryId": "{{category_id}}"
}
```

**Request Body - Depois:**
```json
{
  "name": "batom Rose",
  "description": "batom de cor rose",
  "stockQuantity": 8,
  "price": 15,
  "categoryIds": ["{{category_id}}"]
}
```

### Endpoint: `PATCH /products/:id` (Atualizar Produto)

**Request Body - Antes:**
```json
{
  "name": "Produto Atualizado"
}
```

**Request Body - Depois (exemplo com categorias):**
```json
{
  "name": "Produto Atualizado",
  "categoryIds": ["{{category_id}}"]
}
```

---

## Retrocompatibilidade

⚠️ **BREAKING CHANGE**: Esta é uma alteração que quebra a compatibilidade com versões anteriores.

**O que muda para os clientes da API:**
1. O campo `categoryId` (singular) foi substituído por `categoryIds` (plural, array)
2. As respostas da API agora retornam `categories` (array) ao invés de `category` (objeto único)

**Migração de dados:**
- Todos os produtos existentes que tinham uma categoria foram automaticamente migrados
- Produtos sem categoria continuam sem categoria

---

## Como Usar

### Criar um produto com múltiplas categorias:
```json
POST /products
{
  "name": "Kit de Maquiagem Completo",
  "description": "Kit com itens variados",
  "price": 150.00,
  "stockQuantity": 10,
  "categoryIds": [
    "uuid-categoria-maquiagem",
    "uuid-categoria-kits",
    "uuid-categoria-promocao"
  ]
}
```

### Criar um produto sem categoria:
```json
POST /products
{
  "name": "Produto Teste",
  "description": "Descrição",
  "price": 50.00,
  "stockQuantity": 5
}
```

### Atualizar categorias de um produto:
```json
PATCH /products/:id
{
  "categoryIds": [
    "uuid-nova-categoria-1",
    "uuid-nova-categoria-2"
  ]
}
```

### Remover todas as categorias de um produto:
```json
PATCH /products/:id
{
  "categoryIds": []
}
```

---

## Checklist de Deploy

- [ ] Backup do banco de dados
- [ ] Executar migration: `npm run migration:run`
- [ ] Atualizar cliente/frontend para usar `categoryIds` ao invés de `categoryId`
- [ ] Atualizar cliente/frontend para processar `categories` (array) nas respostas
- [ ] Testar criação de produtos com múltiplas categorias
- [ ] Testar atualização de categorias
- [ ] Testar busca e listagem de produtos
- [ ] Validar que produtos antigos foram migrados corretamente

---

## Rollback

Em caso de necessidade de reverter as alterações:

```bash
npm run migration:revert
```

**Atenção:** O rollback manterá apenas a primeira categoria de cada produto que possui múltiplas categorias.

---

## Impacto nos Endpoints

### Endpoints Não Alterados:
- `GET /products` ✅
- `GET /products/:id` ✅
- `DELETE /products/:id` ✅
- `POST /products/:id/image` ✅
- `PATCH /products/:id/stock` ✅

### Endpoints com Mudanças no Schema:
- `POST /products` ⚠️ (campo `categoryId` → `categoryIds`)
- `PATCH /products/:id` ⚠️ (campo `categoryId` → `categoryIds`)

---

## Testes Recomendados

1. **Criar produto com múltiplas categorias**
2. **Criar produto com uma categoria**
3. **Criar produto sem categoria**
4. **Atualizar produto adicionando categorias**
5. **Atualizar produto removendo todas as categorias**
6. **Buscar produto e verificar array de categorias na resposta**
7. **Listar produtos e verificar relacionamento**
8. **Tentar criar produto com categoryId inválido (deve retornar erro 404)**

---

## Notas Técnicas

- A tabela de junção usa **CASCADE** nas foreign keys, portanto:
  - Deletar um produto remove suas associações de categorias automaticamente
  - Deletar uma categoria remove suas associações com produtos automaticamente
  
- O TypeORM gerencia o relacionamento ManyToMany automaticamente através do `@JoinTable`

- A propriedade `cascade: true` no relacionamento permite que categorias sejam salvas junto com o produto

---

## Autores

- Implementado por: Assistant AI
- Data: 10 de novembro de 2024
- Versão da API: v1.x
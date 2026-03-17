# Realce Seu Brilho API

API RESTful para o e-commerce Realce Seu Brilho, construída com **NestJS** e **TypeScript**.

## Tecnologias

NestJS, TypeScript, TypeORM, MySQL (MariaDB), autenticação JWT com Passport, envio de e-mails via SMTP com Nodemailer, upload de arquivos com Multer e Cloudinary, validação com class-validator, containerização com Docker e Docker Compose.

## Funcionalidades

- 👤 **Usuários**: Cadastro, autenticação e gerenciamento de perfis
- 🔐 **Autenticação**: JWT com refresh token e e-mail de confirmação
- 🛒 **Produtos**: CRUD completo com upload de imagens
- 🏷️ **Categorias**: Organização de produtos por categorias
- 🛍️ **Carrinho**: Gerenciamento de itens no carrinho
- 📦 **Pedidos**: Criação e acompanhamento de pedidos
- 💳 **Pagamentos**: Integração com gateway de pagamento

## Requisitos

- Node.js 20+
- npm ou yarn
- Docker e Docker Compose (para desenvolvimento com containers)

## Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.development

# Configurar banco de dados (MySQL/MariaDB)
# Ou usar Docker Compose:
docker-compose up -d
```

## Rodando o projeto

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Debug mode
npm run start:debug

# Produção
npm run build
npm run start:prod
```

## Migrations

```bash
# Gerar nova migration
npm run migration:generate src/migrations/NomeMigration

# Criar migration vazia
npm run migration:create src/migrations/NomeMigration

# Executar migrations
npm run migration:run

# Reverter migration
npm run migration:revert

# Listar migrations aplicadas
npm run migration:show
```

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## Estrutura do Projeto

```
src/
├── modules/          # Módulos da aplicação
│   ├── auth/         # Autenticação e autorização
│   ├── users/        # Gestão de usuários
│   ├── products/     # Produtos
│   ├── categories/   # Categorias
│   ├── cart/         # Carrinho
│   ├── orders/       # Pedidos
│   └── payments/     # Pagamentos
├── common/           # Utilitários, guards, filters, interceptors
├── config/           # Configurações da aplicação
└── main.ts           # Entry point
```

## Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=realseubrilho
DB_PASSWORD=sua_senha
DB_DATABASE=realseubrilho

# JWT
JWT_SECRET=sua_secret_key
JWT_EXPIRES_IN=7d

# E-mail
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=seu_email
MAIL_PASSWORD=sua_senha

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Licença

UNLICENSED - Todos os direitos reservados.

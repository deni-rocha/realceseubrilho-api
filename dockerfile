# Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Compila apenas as migrations para JavaScript
RUN npx tsc --outDir dist --rootDir src --module commonjs --target ES2023 --esModuleInterop src/database/migrations/*.ts

# Estágio de Execução
FROM node:20-alpine AS runner

WORKDIR /app

# Instala apenas dependências de produção para reduzir o tamanho
COPY package*.json ./
RUN npm install --only=production

# Copia o build, migrations e entrypoint
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/entrypoint.sh ./scripts/entrypoint.sh
COPY --from=builder /app/.env.docker ./.env

# Dá permissão de execução ao script
RUN chmod +x ./scripts/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./scripts/entrypoint.sh"]

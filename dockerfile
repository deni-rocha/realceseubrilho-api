# Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio de Execução
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instala apenas dependências de produção para reduzir o tamanho
COPY package*.json ./
RUN npm install --only=production

# Copia o build e o entrypoint
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/entrypoint.sh ./scripts/entrypoint.sh

# Dá permissão de execução ao script
RUN chmod +x ./scripts/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./scripts/entrypoint.sh"]
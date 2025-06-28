FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci
COPY . .

RUN npm run build


FROM node:20-alpine AS production


WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules


COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
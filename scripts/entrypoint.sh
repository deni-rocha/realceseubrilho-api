#!/bin/sh

# Aguarda o banco de dados se necessário (opcional se usar healthcheck no compose)
echo "Rodando migrations..."
npm run typeorm migration:run -- -d dist/ormconfig.js

echo "Iniciando a aplicação..."
node dist/main.js
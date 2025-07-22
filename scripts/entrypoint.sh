#!/bin/sh

# Executa migrações do TypeORM
npx typeorm migration:run --dataSource /app/dist/ormconfig.js

# Sobe a aplicação
node /app/dist/src/main
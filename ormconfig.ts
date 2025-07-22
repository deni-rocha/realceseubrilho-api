// ormconfig.ts (ou data-source.ts) na RAIZ do seu projeto
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

console.log(`Ambiente atual: ${process.env.NODE_ENV}`);
if (isProduction) {
  console.log('Rodando em produção');
} else if (isDevelopment) {
  console.log('Rodando em desenvolvimento');
} else {
  console.log('Ambiente não identificado');
}

export default new DataSource({
  type: 'postgres',
  url: isProduction ? process.env.DIRECT_URL : process.env.DEV_DATABASE_URL,
  entities: [
   __dirname + '/src/**/*.entity{.ts,.js}',
  ],
  migrations: [
    __dirname + '/src/database/migrations/*.{ts,js}',
  ],
  synchronize: false, // SEMPRE FALSE para o CLI e em produção!
  logging: ['query', 'error'],
});
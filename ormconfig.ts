// ormconfig.ts (ou data-source.ts) na RAIZ do seu projeto
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega o arquivo .env apropriado baseado no NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test' 
    ? '.env.test' 
    : '.env.development';

const envPath = path.resolve(process.cwd(), envFile);
dotenv.config({ path: envPath });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'realceseubrilho',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/database/migrations/*.{ts,js}'],
  synchronize: false, // SEMPRE FALSE para o CLI e em produção!
  logging: ['query', 'error'],
});

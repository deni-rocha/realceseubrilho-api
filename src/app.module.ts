import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryModule } from './product-category/product-category.module';
import { ProductModule } from './product/product.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Verifica se é ambiente de desenvolvimento
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
        type: 'postgres',
        url: isProduction ? configService.get<string>('POOL_DATABASE_URL') : configService.get<string>('DEV_DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/../src/database/migrations/*.{ts,js}'],
        migrationsRun: false,
      }},
      inject: [ConfigService],
    }),
    DatabaseModule,
    UsersModule,
    ProductCategoryModule,
    ProductModule,
    ShoppingCartModule,
    OrderModule,
    PaymentModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

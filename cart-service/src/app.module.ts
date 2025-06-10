// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // <-- TAMBAHKAN INI

// Impor modul dan entitas yang spesifik untuk Cart Service
import { CartModule } from './cart/cart.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar';
import { Cart } from './cart/entity/cart.entity'; 
import { CartItem } from './cart/entity/cart-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    // Konfigurasi GraphQL Module sebagai subgraph federasi
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: join(process.cwd(), 'src/federated-schema.gql'),
      },
      sortSchema: true,
      playground: true, 
    }),
    // Konfigurasi TypeORM untuk database Cart Service
    TypeOrmModule.forRoot({
      name: 'default', 
      type: 'mysql',
      // Ambil nilai dari variabel lingkungan yang disuntikkan oleh Docker Compose
      host: process.env.DB_HOST || 'localhost', 
      port: parseInt(process.env.DB_PORT || '3306', 10), 
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_DATABASE || 'cart_service', 
      entities: [Cart, CartItem], 
      synchronize: true, 
      logging: true, 
    }),
    CartModule, 
  ],
  controllers: [], 
  // DateTimeScalar harus ada di providers
  providers: [DateTimeScalar], 
})
export class AppModule {}
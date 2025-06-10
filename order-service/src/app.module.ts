// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { OrderModule } from './order/order.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; 
import { Order } from './order/entity/order.entity'; 
import { OrderItem } from './order/entity/order-item.entity';

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
    // Konfigurasi TypeORM untuk database Order Service
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost', 
      port: parseInt(process.env.DB_PORT || '3306', 10), 
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_DATABASE || 'order_service', 
      // Daftarkan entitas secara eksplisit untuk kejelasan
      entities: [Order, OrderItem], 
      synchronize: true, 
      logging: true, 
    }),
    OrderModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}
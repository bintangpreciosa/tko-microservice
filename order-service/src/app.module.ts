// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; 
import { Order } from './order/entity/order.entity'; 
import { OrderItem } from './order/entity/order-item.entity';

@Module({
  imports: [
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
      name: 'orderConnection', 
      type: 'mysql',
      host: 'localhost', 
      port: 3306,
      username: 'root',
      password: '',
      database: 'order_service', 
      entities: [join(__dirname, '**', '*.entity.{ts,js}')], 
      synchronize: false, 
      logging: false,
    }),
    OrderModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}

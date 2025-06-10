// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar';
import { Payment } from './payment/entity/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2, 
        path: join(process.cwd(), 'src/federated-schema.gql'), 
      },
      sortSchema: true,
      playground: true, 
      buildSchemaOptions: {
      },
    }),
    TypeOrmModule.forRoot({
      name: 'default', 
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost', 
      port: parseInt(process.env.DB_PORT || '3306', 10), 
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_DATABASE || 'payment_service', 
      entities: [Payment], 
      synchronize: true, 
      logging: true, 
    }),
    PaymentModule,
  ],
  controllers: [],
  providers: [DateTimeScalar],
})
export class AppModule {}
// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { ProductModule } from './product/product.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar';
import { Product } from './product/entity/product.entity'; 

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
    // Konfigurasi TypeORM untuk database Product Service
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST, 
      port: parseInt(process.env.DB_PORT || '3306', 10), 
      username: process.env.DB_USERNAME, 
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_DATABASE, 
      entities: [Product], 
      synchronize: true, 
      logging: true, 
    }),
    ProductModule,
  ],
  controllers: [],
  providers: [DateTimeScalar],
})
export class AppModule {}
// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config'; 

import { CustomerModule } from './customer/customer.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; 
// import { HealthModule } from './health/health.module'; // UNCOMMENT INI
// === TAMBAHKAN INI === //
// import * as dotenv from 'dotenv';
// dotenv.config();
// ===================== //

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
    
    CustomerModule, 
    // HealthModule,
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}
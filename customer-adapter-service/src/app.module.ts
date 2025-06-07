// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CustomerModule } from './customer/customer.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; 

@Module({
  imports: [
    // Konfigurasi GraphQL Module sebagai subgraph federasi
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2, 
        path: join(process.cwd(), 'src/schema.gql'), 
      },
      sortSchema: true,
      playground: true, 
    }),
    
    CustomerModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Impor modul dan entitas yang spesifik untuk Customer Adapter Service
import { CustomerModule } from './customer/customer.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; // DateTimeScalar ada di folder common

@Module({
  imports: [
    // Konfigurasi GraphQL Module sebagai subgraph federasi
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2, // Mengaktifkan Federation v2
        path: join(process.cwd(), 'src/schema.gql'), // Path untuk skema yang dihasilkan
      },
      sortSchema: true,
      playground: true, // Biarkan playground aktif untuk debugging subgraph
    }),
    
    CustomerModule, // Daftarkan CustomerModule di sini
  ],
  controllers: [], // Subgraph GraphQL umumnya tidak memiliki controller API REST biasa
  providers: [DateTimeScalar], // Daftarkan DateTimeScalar
})
export class AppModule {}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar';
import { Payment } from './payment/entity/payment.entity';
// // === TAMBAHKAN INI === //
// import * as dotenv from 'dotenv'; 
// dotenv.config();
// // ===================== //

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
    // ==================== UBAH INI ==================== //
    TypeOrmModule.forRoot({
      name: 'paymentConnection',
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME ?? 'root', 
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_DATABASE ?? 'payment_service',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: false,
      logging: false,
      retryAttempts: 10, // Jumlah percobaan ulang koneksi
      retryDelay: 3000,  // Penundaan 3 detik antar percobaan
      extra: {
        connectionLimit: 10,
        charset: 'utf8mb4_bin', // Standardisasi charset
        acquireTimeout: 30000, // Timeout untuk mendapatkan koneksi dari pool (30 detik)
      },
    }),
    // ================================================== //
    PaymentModule,
  ],
  controllers: [],
  providers: [DateTimeScalar],
})
export class AppModule {}
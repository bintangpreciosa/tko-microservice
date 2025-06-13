// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { CartModule } from './cart/cart.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar';
import { Cart } from './cart/entity/cart.entity'; 
import { CartItem } from './cart/entity/cart-item.entity';
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
    }),
    // ==================== UBAH INI ==================== //
    TypeOrmModule.forRoot({
      name: 'cartConnection',
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME ?? 'root', 
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_DATABASE ?? 'cart_service',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
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
    CartModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}
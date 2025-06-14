// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { OrderModule } from './order/order.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; 
import { Order } from './order/entity/order.entity'; 
import { OrderItem } from './order/entity/order-item.entity';
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
      name: 'orderConnection',
      type: 'mysql',
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USERNAME!, 
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,
      entities: [join(__dirname, '**/*.entity.{ts,js}')],
      synchronize: true, // Aktifkan untuk development
      logging: false,
      retryAttempts: 10, // Jumlah percobaan ulang koneksi
      retryDelay: 3000,  // Penundaan 3 detik antar percobaan
      extra: {
        connectionLimit: 10,
        charset: 'utf8mb4_bin', // Standardisasi charset
      },
    }),
    // ================================================== //
    OrderModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}
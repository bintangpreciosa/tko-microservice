// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { ShipmentModule } from './shipment/shipment.module';
import { DateTimeScalar } from './common/scalars/datetime.scalar'; 
import { Shipment } from './shipment/entity/shipment.entity'; 
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
      name: 'shipmentConnection',
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
    ShipmentModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}
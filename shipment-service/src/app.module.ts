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
    TypeOrmModule.forRootAsync({
      name: 'shipmentConnection', // Nama koneksi untuk DI
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD') || '',
        database: configService.get<string>('DB_DATABASE'),
        entities: [Shipment], 
        synchronize: true, 
        logging: true, 
      }),
    }),
    ShipmentModule, 
  ],
  controllers: [], 
  providers: [DateTimeScalar], 
})
export class AppModule {}
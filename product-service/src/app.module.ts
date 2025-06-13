// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
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
    // Konfigurasi TypeORM untuk database Product Service menggunakan forRootAsync
    TypeOrmModule.forRootAsync({
      name: 'productConnection', // Nama koneksi untuk DI
      imports: [ConfigModule],

      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD') || '',
        database: configService.get<string>('DB_DATABASE'),
        entities: [Product],
        synchronize: true,
        logging: true,
      }),
    }),
    ProductModule,
  ],
  controllers: [],
  providers: [DateTimeScalar],
})
export class AppModule {}
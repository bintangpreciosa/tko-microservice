    // src/app.module.ts
    import { Module } from '@nestjs/common';
    import { GraphQLModule } from '@nestjs/graphql';
    import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
    import { join } from 'path';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { ShipmentModule } from './shipment/shipment.module';
    import { DateTimeScalar } from './common/scalars/datetime.scalar'; 
    import { Shipment } from './shipment/entity/shipment.entity'; 

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
        // Konfigurasi TypeORM untuk database Shipment Service
        TypeOrmModule.forRoot({
          name: 'shipmentConnection', 
          type: 'mysql',
          host: 'localhost', 
          port: 3306,
          username: 'root',
          password: '',
          database: 'shipment_service', 
          entities: [join(__dirname, '**', '*.entity.{ts,js}')], 
          synchronize: false, 
          logging: false,
        }),
        ShipmentModule, 
      ],
      controllers: [], 
      providers: [DateTimeScalar], 
    })
    export class AppModule {}
    
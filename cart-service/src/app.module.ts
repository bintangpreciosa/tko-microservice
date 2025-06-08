    // src/app.module.ts
    import { Module } from '@nestjs/common';
    import { GraphQLModule } from '@nestjs/graphql';
    import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
    import { join } from 'path';
    import { TypeOrmModule } from '@nestjs/typeorm';

    // Impor modul dan entitas yang spesifik untuk Cart Service
    import { CartModule } from './cart/cart.module';
    import { DateTimeScalar } from './common/scalars/datetime.scalar';
    import { Cart } from './cart/entity/cart.entity'; 
    import { CartItem } from './cart/entity/cart-item.entity';

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
        // Konfigurasi TypeORM untuk database Cart Service
        TypeOrmModule.forRoot({
          name: 'cartConnection',
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'cart_service', 
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: false, 
          logging: false,
        }),
        CartModule, 
      ],
      controllers: [], 
      providers: [DateTimeScalar], 
    })
    export class AppModule {}
    
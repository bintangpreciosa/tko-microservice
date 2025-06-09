    // src/app.module.ts
    import { Module } from '@nestjs/common';
    import { GraphQLModule } from '@nestjs/graphql';
    import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
    import { join } from 'path';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { PaymentModule } from './payment/payment.module';
    import { DateTimeScalar } from './common/scalars/datetime.scalar';
    import { Payment } from './payment/entity/payment.entity';

    @Module({
      imports: [
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
        TypeOrmModule.forRoot({
          name: 'paymentConnection',
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'payment_service',
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: false,
          logging: false,
        }),
        PaymentModule,
      ],
      controllers: [],
      providers: [DateTimeScalar],
    })
    export class AppModule {}
    
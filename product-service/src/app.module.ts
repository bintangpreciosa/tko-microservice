    // src/app.module.ts
    import { Module } from '@nestjs/common';
    import { GraphQLModule } from '@nestjs/graphql';
    import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo'; // <-- PENTING: Gunakan ApolloFederationDriver
    import { join } from 'path';
    import { TypeOrmModule } from '@nestjs/typeorm';

    // Impor modul dan entitas yang spesifik untuk Product Service
    import { ProductModule } from './product/product.module'; // Import ProductModule
    import { DateTimeScalar } from './common/scalars/datetime.scalar'; // Import DateTimeScalar
    import { Product } from './product/entity/product.entity'; // Entitas produk

    @Module({
      imports: [
        // Konfigurasi GraphQL Module sebagai subgraph federasi
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({ // <-- Menggunakan ApolloFederationDriverConfig
          driver: ApolloFederationDriver, // Menggunakan driver federasi
          autoSchemaFile: {
            federation: 2, // Mengaktifkan Federation v2
            path: join(process.cwd(), 'src/schema.gql'), // Path untuk skema yang dihasilkan
          },
          sortSchema: true,
          playground: true, // Biarkan playground aktif untuk debugging subgraph
        }),
        // Konfigurasi TypeORM untuk database Product Service
        TypeOrmModule.forRoot({
          name: 'productConnection', // Nama koneksi yang digunakan oleh ProductService
          type: 'mysql',
          host: 'localhost', // Tetap localhost atau ganti jika Anda pakai Docker compose DB
          port: 3306,
          username: 'root',
          password: '',
          database: 'product_service', // Database khusus Product Service
          entities: [join(__dirname, '**', '*.entity.{ts,js}')], // Memuat semua entitas (dari src/product/entity)
          synchronize: false, // PASTIKAN FALSE setelah tabel dibuat!
          logging: false,
        }),
        ProductModule, // Daftarkan ProductModule di sini
      ],
      controllers: [], // Tidak ada controller di sini karena ini GraphQL service
      providers: [DateTimeScalar], // Daftarkan DateTimeScalar
    })
    export class AppModule {}
    
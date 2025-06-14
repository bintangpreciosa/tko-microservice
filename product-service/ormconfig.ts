// D:\tko-microservice\product-service\ormconfig.ts
// CATATAN: Ini adalah versi yang diperbaiki untuk masalah ECONNREFUSED dari CLI lokal

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Muat variabel lingkungan jika belum dimuat (untuk lingkungan CLI lokal)
dotenv.config({ path: '../../.env' }); 

const configOptions: DataSourceOptions = {
  type: 'mysql',
  // === PERBAIKAN DI SINI UNTUK CLI LOKAL ===
  // Ketika dijalankan di CLI lokal, process.env.DB_HOST mungkin kosong,
  // sehingga fallback ke 'localhost'.
  // Namun, port yang diekspos Docker ke host adalah 3307 untuk products.
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307', 10), // <-- UBAH KE PORT YANG DIEXPOSE DOCKER KE HOST
  // ==========================================
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'product_service',
  
  entities: [__dirname + '/dist/product/entity/*.entity.{js,ts}'], 
  migrations: [__dirname + '/dist/migrations/*.{js,ts}'], 

  synchronize: true, // Aktifkan untuk development - akan sync otomatis dengan entity
  logging: true, 
  migrationsRun: false, 
  
  extra: {
    connectionLimit: 10,
    charset: 'utf8mb4_bin',
  },
};

const dataSource = new DataSource(configOptions);
export default dataSource;

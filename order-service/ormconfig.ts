// D:\tko-microservice\order-service\ormconfig.ts
// CATATAN: Ini adalah versi FINAL yang diperbaiki untuk masalah "export of a DataSource instance"
// dan port fallback yang benar untuk CLI lokal.

import { DataSource, DataSourceOptions } from 'typeorm'; // Impor DataSource
import * as dotenv from 'dotenv';

// Muat variabel lingkungan jika belum dimuat (untuk lingkungan CLI lokal)
// Sesuaikan path jika .env Anda ada di root monorepo.
// Jika .env ada di D:\tko-microservice\.env, path-nya adalah '../../.env' dari sini.
dotenv.config({ path: '../../.env' }); 

const configOptions: DataSourceOptions = { // Ubah nama variabel untuk konfigurasinya
  type: 'mysql',
  // Gunakan variabel lingkungan. Di sini pakai fallback '||' karena
  // saat menjalankan perintah CLI secara lokal, process.env mungkin belum diset.
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3308', 10), // <-- UBAH KE PORT YANG DIEXPOSE DOCKER KE HOST (3308 untuk Order)
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  // === PENYESUAIAN KHUSUS UNTUK ORDER SERVICE ===
  database: process.env.DB_DATABASE || 'order_service', // Nama database untuk Order Service
  
  // Path ke entitas Order Service.
  // Sesuaikan jika entitas Anda tidak berada di 'dist/order/entity'
  entities: [__dirname + '/dist/order/entity/*.entity.{js,ts}'], 
  
  // Path ke file migrasi Order Service.
  // Sesuaikan jika folder migrasi Anda tidak berada di 'dist/migrations'
  migrations: [__dirname + '/dist/migrations/*.{js,ts}'], 
  // ===============================================

  synchronize: false, 
  logging: true, 
  migrationsRun: false,
  
  extra: {
    connectionLimit: 10,
    charset: 'utf8mb4_bin',
  },
};

// === PERBAIKAN: Export instance DataSource ===
const dataSource = new DataSource(configOptions); // Buat instance DataSource
export default dataSource; // Ekspor instance DataSource

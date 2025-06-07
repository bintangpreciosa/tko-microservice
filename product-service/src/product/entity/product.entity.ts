// src/product/entity/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Product') 
export class Product {
  @PrimaryGeneratedColumn('increment') // product_id INT AUTO_INCREMENT PRIMARY KEY
  product_id: number; // Tipe data TypeScript untuk kolom ID

  @Column({ type: 'varchar', length: 255, nullable: false }) // name VARCHAR(255) NOT NULL
  name: string;

  @Column({ type: 'text', nullable: true }) // description TEXT
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false }) // price DECIMAL(12,2) NOT NULL
  price: number; // TypeORM akan menangani DECIMAL sebagai number di TypeScript

  @Column({ type: 'int', nullable: false }) // stock INT NOT NULL
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true }) // image_url VARCHAR(255)
  image_url: string;

  @Column({ type: 'varchar', length: 50, default: 'active' }) // status VARCHAR(50) DEFAULT 'active'
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  created_at: Date; // TypeORM akan memetakan DATETIME ke objek Date

  @Column({ type: 'timestamp', default: null, onUpdate: 'CURRENT_TIMESTAMP' }) // updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
  updated_at: Date; // TypeORM akan memetakan DATETIME ke objek Date. 'onUpdate' adalah fitur TypeORM untuk MySQL ON UPDATE CURRENT_TIMESTAMP
}
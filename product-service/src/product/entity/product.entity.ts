// src/product/entity/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Product') 
export class Product {
  @PrimaryGeneratedColumn('increment') 
  product_id: number; // TypeORM 

  @Column({ type: 'varchar', length: 255, nullable: false }) 
  name: string;

  @Column({ type: 'text', nullable: true }) 
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false }) 
  price: number; 

  @Column({ type: 'int', nullable: false })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true }) 
  image_url: string;

  @Column({ type: 'varchar', length: 50, default: 'active' }) 
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) 
  created_at: Date; 

  @Column({ type: 'timestamp', default: null, onUpdate: 'CURRENT_TIMESTAMP' }) 
  updated_at: Date; 
}
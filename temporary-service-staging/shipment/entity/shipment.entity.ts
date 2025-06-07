// src/shipment/entity/shipment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// TIDAK PERLU IMPORT Order di sini karena tidak ada relasi langsung TypeORM antar-database

@Entity('Shipment') // Nama tabel di database adalah 'Shipment'
export class Shipment {
  @PrimaryGeneratedColumn()
  shipment_id: number;

  @Column()
  order_id: number; // Ini akan tetap sebagai Foreign Key manual (kolom biasa)

  @Column({ type: 'timestamp', nullable: true })
  shipment_date: Date | null; // Tanggal pengiriman

  @Column({ type: 'timestamp', nullable: true })
  delivery_date: Date | null; // Tanggal estimasi/aktual pengiriman

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true }) 
  courier_name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true }) 
  tracking_number: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true }) 
  shipping_address_street: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true }) 
  shipping_address_city: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true }) 
  shipping_address_postal_code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true }) 
  shipping_address_country: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
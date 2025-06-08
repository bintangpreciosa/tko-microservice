// src/order/entity/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity'; 

@Entity('Order') 
export class Order {
  @PrimaryGeneratedColumn('increment') // order_id INT AUTO_INCREMENT PRIMARY KEY
  order_id: number;

  // customer_crm_id VARCHAR(255) NOT NULL - Mengacu pada ID customer dari CRM
  @Column({ type: 'varchar', length: 255, nullable: false })
  customer_crm_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  order_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false }) // total_price DECIMAL(12,2) NOT NULL
  total_price: number;

  @Column({ type: 'varchar', length: 50, nullable: true }) // payment_status VARCHAR(50)
  payment_status: string | null; // Bisa string atau null, karena nullable:true di kolom DB

  @Column({ type: 'varchar', length: 50, nullable: true }) // shipping_status VARCHAR(50)
  shipping_status: string | null; // Bisa string atau null, karena nullable:true di kolom DB

  // Snapshot alamat pengiriman (untuk riwayat dan decoupling)
  @Column({ type: 'varchar', length: 255, nullable: true })
  shipping_address_street: string | null; // Bisa string atau null

  @Column({ type: 'varchar', length: 255, nullable: true })
  shipping_address_city: string | null; // Bisa string atau null

  @Column({ type: 'varchar', length: 20, nullable: true })
  shipping_address_postal_code: string | null; // Bisa string atau null

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipping_address_country: string | null; // Bisa string atau null

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: null, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // Definisi relasi One-to-Many dengan OrderItem
  // cascade: true berarti jika Order disimpan/dihapus, OrderItem terkait juga ikut
  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  order_items: OrderItem[];

}
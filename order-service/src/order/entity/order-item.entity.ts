// src/order/entity/order-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity'; 

@Entity('OrderItem') 
export class OrderItem {
  @PrimaryGeneratedColumn('increment') // order_item_id INT AUTO_INCREMENT PRIMARY KEY
  order_item_id: number;

  // order_id INT NOT NULL - Foreign Key ke tabel 'Order'
  @Column({ type: 'int', nullable: false })
  order_id: number;

  @Column({ type: 'int', nullable: false }) // product_id INT NOT NULL
  product_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false }) // product_name VARCHAR(255) NOT NULL (snapshot)
  product_name: string;

  @Column({ type: 'int', nullable: false }) // quantity INT NOT NULL
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false }) // price DECIMAL(12,2) NOT NULL (snapshot)
  price: number;

  // Definisi relasi Many-to-One dengan Order
  @ManyToOne(() => Order, order => order.order_items)
  @JoinColumn({ name: 'order_id' }) // Kolom di tabel ini yang menjadi foreign key
  order: Order;
}
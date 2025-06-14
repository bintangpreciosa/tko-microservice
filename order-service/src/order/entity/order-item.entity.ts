// src/order/entity/order-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity'; 

@Entity('OrderItem') 
export class OrderItem {
  @PrimaryGeneratedColumn('increment') 
  order_item_id: number;

  @Column({ type: 'int', nullable: false })
  order_id: number;

  @Column({ type: 'int', nullable: false }) 
  product_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false }) 
  product_name: string;

  @Column({ type: 'int', nullable: false }) 
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false }) 
  price: number;

  // Definisi relasi Many-to-One dengan Order
  @ManyToOne(() => Order, order => order.order_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' }) 
  order: Order;
}
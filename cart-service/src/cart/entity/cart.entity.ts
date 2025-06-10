// src/cart/entity/cart.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartItem } from './cart-item.entity'; 

@Entity('Cart')
export class Cart {
  @PrimaryGeneratedColumn('increment')
  cart_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customer_crm_id: string | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  session_id: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) 
  total_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CartItem, cartItem => cartItem.cart, { cascade: true })
  cart_items: CartItem[];
}
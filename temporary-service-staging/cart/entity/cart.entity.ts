// src/cart/entity/cart.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartItem } from './cart-item.entity'; 

@Entity('Cart')
export class Cart {
  @PrimaryGeneratedColumn()
  cart_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customer_crm_id: string | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  session_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relasi One-to-Many dengan CartItem
  // Pastikan properti 'cart' di CartItem merujuk kembali ke sini.
  @OneToMany(() => CartItem, cartItem => cartItem.cart, { cascade: true })
  cart_items: CartItem[];
}
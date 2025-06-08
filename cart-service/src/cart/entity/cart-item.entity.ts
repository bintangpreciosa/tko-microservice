// src/cart/entity/cart-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity'; 

@Entity('CartItem')
export class CartItem {
  @PrimaryGeneratedColumn()
  cart_item_id: number;

  @Column()
  cart_id: number; 

  @Column()
  product_id: number; 

  @Column({ type: 'varchar', length: 255 }) // Pastikan tipe kolom
  product_name: string; 

  @Column() // Pastikan tipe kolom
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 }) // Pastikan tipe kolom
  price: number; 

  // Relasi Many-to-One dengan Cart (Pastikan properti ini ada dan benar)
  @ManyToOne(() => Cart, cart => cart.cart_items)
  @JoinColumn({ name: 'cart_id' }) 
  cart: Cart;
}
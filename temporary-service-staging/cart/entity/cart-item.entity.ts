// src/cart/entity/cart-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity'; 

@Entity('CartItem')
export class CartItem {
  @PrimaryGeneratedColumn()
  cart_item_id: number;

  // order_id tetap di sini (jika tidak ada relasi langsung)
  @Column()
  cart_id: number; // Foreign key ke tabel Cart

  @Column()
  product_id: number; // ID produk dari Product Service (Foreign Key manual)

  @Column({ type: 'varchar', length: 255 }) // Pastikan tipe kolom
  product_name: string; // Snapshot nama produk

  @Column() // Pastikan tipe kolom
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 }) // Pastikan tipe kolom
  price: number; // Harga per unit (snapshot saat ditambahkan)

  // Relasi Many-to-One dengan Cart (Pastikan properti ini ada dan benar)
  @ManyToOne(() => Cart, cart => cart.cart_items)
  @JoinColumn({ name: 'cart_id' }) // Kolom di tabel ini yang menjadi foreign key
  cart: Cart;
}
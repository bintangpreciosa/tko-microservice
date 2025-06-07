// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 

import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { Cart } from './entity/cart.entity'; 
import { CartItem } from './entity/cart-item.entity'; 

import { ProductModule } from '../product/product.module'; 
import { CustomerModule } from '../customer/customer.module'; 

@Module({
  imports: [
    // Mendaftarkan entitas Cart dan CartItem untuk koneksi database 'cartConnection'
    TypeOrmModule.forFeature([Cart, CartItem], 'cartConnection'), // Gunakan nama koneksi 'cartConnection'
    // Mengimpor ProductModule dan CustomerModule agar CartService bisa menggunakan service dari modul tersebut
    ProductModule,
    CustomerModule,
  ],
  providers: [CartService, CartResolver],
  exports: [CartService] // Ekspor CartService agar bisa digunakan modul lain (misalnya OrderService saat checkout)
})
export class CartModule {}
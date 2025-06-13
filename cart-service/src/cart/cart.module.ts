// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'; 
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { CartItemResolver } from './cart-item.resolver';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem], 'cartConnection'),
  ],
  providers: [
    CartService, 
    CartResolver,
    CartItemResolver,
    {
      provide: getRepositoryToken(Cart, 'cartConnection'),
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Cart),
      inject: [DataSource], // Memastikan DataSource diinjeksikan untuk mendapatkan repositori
    },
    {
      provide: getRepositoryToken(CartItem, 'cartConnection'),
      useFactory: (dataSource: DataSource) => dataSource.getRepository(CartItem),
      inject: [DataSource],
    },
  ],
  exports: [
    CartService
  ],
})
export class CartModule {}
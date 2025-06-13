// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { CartItemResolver } from './cart-item.resolver';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Cart, CartItem])
  ],
  providers: [
    CartService, 
    CartResolver,
    CartItemResolver
  ],
})
export class CartModule {}
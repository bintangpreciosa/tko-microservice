// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { OrderItemResolver } from './order-item.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem], 'orderConnection'),
  ],
  providers: [
    OrderService, 
    OrderResolver,
    OrderItemResolver
  ],
  exports: [OrderService] 
})
export class OrderModule {}

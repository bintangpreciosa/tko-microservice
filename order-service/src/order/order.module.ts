// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem], 'orderConnection'),
  ],
  providers: [OrderService, OrderResolver],
  exports: [OrderService] 
})
export class OrderModule {}

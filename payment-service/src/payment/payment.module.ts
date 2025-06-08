// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule

import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { Payment } from './entity/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment], 'paymentConnection'),
  ],
  providers: [PaymentService, PaymentResolver],
  exports: [PaymentService] 
})
export class PaymentModule {}

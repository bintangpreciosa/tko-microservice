// src/customer/customer.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerResolver } from 'src/customer/customer.resolver';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [CustomerResolver, CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}

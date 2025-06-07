// src/customer/customer.module.ts
import { Module } from '@nestjs/common'; 
import { CustomerService } from './customer.service';
import { CustomerResolver } from './customer.resolver';

@Module({
  imports: [],
  providers: [CustomerService, CustomerResolver], 
  exports: [CustomerService] 
})
export class CustomerModule {}

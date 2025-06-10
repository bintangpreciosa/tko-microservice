// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Product } from './entity/product.entity'; 

@Module({
  imports: [ 
    TypeOrmModule.forFeature([Product], 'productConnection'),
  ],
  providers: [ProductService, ProductResolver], 
  exports: [ProductService] 
})
export class ProductModule {}
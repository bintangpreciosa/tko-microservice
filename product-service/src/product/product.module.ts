// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Product } from './entity/product.entity'; 

@Module({
  imports: [ 
    // Mendaftarkan entitas Product ke TypeORM untuk koneksi 'productConnection'
    TypeOrmModule.forFeature([Product], 'productConnection'),
  ],
  providers: [ProductService, ProductResolver], // Pastikan ProductService dan ProductResolver terdaftar
  exports: [ProductService] // Ekspor ProductService agar bisa digunakan modul lain (misalnya CartService)
})
export class ProductModule {}
// src/shipment/shipment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 

import { ShipmentService } from './shipment.service';
import { ShipmentResolver } from './shipment.resolver';
import { Shipment } from './entity/shipment.entity'; 

import { OrderModule } from '../order/order.module'; 

@Module({
  imports: [
    // Mendaftarkan entitas Shipment untuk koneksi database 'shipmentConnection'
    TypeOrmModule.forFeature([Shipment], 'shipmentConnection'), 
    // Mengimpor OrderModule agar ShipmentService bisa menggunakan OrderService
    OrderModule,
  ],
  providers: [ShipmentService, ShipmentResolver],
  exports: [ShipmentService] // Ekspor ShipmentService jika akan digunakan modul lain
})
export class ShipmentModule {}
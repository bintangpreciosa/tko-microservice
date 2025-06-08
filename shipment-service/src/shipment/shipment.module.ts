    // src/shipment/shipment.module.ts
    import { Module } from '@nestjs/common';
    import { TypeOrmModule } from '@nestjs/typeorm';

    import { ShipmentService } from './shipment.service';
    import { ShipmentResolver } from './shipment.resolver';
    import { Shipment } from './entity/shipment.entity';

    @Module({
      imports: [
        TypeOrmModule.forFeature([Shipment], 'shipmentConnection'),
      ],
      providers: [ShipmentService, ShipmentResolver],
      exports: [ShipmentService] 
    })
    export class ShipmentModule {}
    
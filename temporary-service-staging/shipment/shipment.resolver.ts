// src/shipment/shipment.resolver.ts
import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { ShipmentService } from './shipment.service';
import { ShipmentDTO, CreateShipmentInput, UpdateShipmentInput, ShipmentFilters } from './dto/shipment.dto';
import { OrderService } from '../order/order.service'; 
import { OrderDTO } from '../order/dto/order.dto'; 

@Resolver(() => ShipmentDTO)
export class ShipmentResolver {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly orderService: OrderService, 
  ) {}

  // Query untuk mengambil satu pengiriman berdasarkan ID
  @Query(() => ShipmentDTO, { nullable: true, description: 'Mendapatkan detail pengiriman berdasarkan ID.' })
  async shipment(@Args('shipment_id', { type: () => ID }) shipment_id: number): Promise<ShipmentDTO | null> {
    return this.shipmentService.findOneById(shipment_id);
  }

  // Query untuk mengambil semua pengiriman (dengan filter opsional)
  @Query(() => [ShipmentDTO], { description: 'Mendapatkan daftar semua pengiriman (dapat difilter).' })
  async allShipments(@Args('filters', { type: () => ShipmentFilters, nullable: true }) filters?: ShipmentFilters): Promise<ShipmentDTO[]> {
    return this.shipmentService.findAll(filters);
  }

  // Mutation untuk membuat pengiriman baru
  @Mutation(() => ShipmentDTO, { description: 'Membuat pengiriman baru.' })
  async createShipment(@Args('input') input: CreateShipmentInput): Promise<ShipmentDTO> {
    return this.shipmentService.create(input);
  }

  // Mutation untuk memperbarui pengiriman
  @Mutation(() => ShipmentDTO, { description: 'Memperbarui pengiriman yang sudah ada.' })
  async updateShipment(
    @Args('shipment_id', { type: () => ID }) shipment_id: number,
    @Args('input') input: UpdateShipmentInput,
  ): Promise<ShipmentDTO> {
    return this.shipmentService.update(shipment_id, input);
  }

  // Mutation untuk menghapus pengiriman
  @Mutation(() => Boolean, { description: 'Menghapus pengiriman berdasarkan ID.' })
  async deleteShipment(@Args('shipment_id', { type: () => ID }) shipment_id: number): Promise<boolean> {
    return this.shipmentService.delete(shipment_id);
  }

  // Field Resolver untuk mendapatkan detail Order terkait
  // Ini akan dipanggil hanya jika client meminta field 'order' di dalam query Shipment
  @ResolveField('order', () => OrderDTO, { nullable: true, description: 'Detail pesanan terkait dengan pengiriman ini.' })
  async getOrder(@Parent() shipment: ShipmentDTO): Promise<OrderDTO | null> {
    // Secara eksplisit memanggil OrderService untuk mendapatkan detail order
    // Menggunakan order_id dari ShipmentDTO
    return this.orderService.findOneById(shipment.order_id);
  }
}
// src/shipment/shipment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Shipment } from './entity/shipment.entity'; 
import { CreateShipmentInput, UpdateShipmentInput, ShipmentDTO, ShipmentFilters } from './dto/shipment.dto'; // Import DTOs
import { OrderService } from '../order/order.service'; 
import { OrderDTO } from '../order/dto/order.dto'; 

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment, 'shipmentConnection') 
    private shipmentRepository: Repository<Shipment>,
    private orderService: OrderService, 
  ) {}

  // Helper untuk mengubah Shipment Entity menjadi ShipmentDTO
  private mapShipmentToDTO(shipment: Shipment | null): ShipmentDTO | null {
    if (!shipment) return null; 

    const shipmentDTO = new ShipmentDTO();
    shipmentDTO.shipment_id = shipment.shipment_id;
    shipmentDTO.order_id = shipment.order_id;
    shipmentDTO.shipment_date = shipment.shipment_date?.toISOString() ?? null;
    shipmentDTO.delivery_date = shipment.delivery_date?.toISOString() ?? null;
    shipmentDTO.status = shipment.status;
    shipmentDTO.courier_name = shipment.courier_name ?? null;
    shipmentDTO.tracking_number = shipment.tracking_number ?? null;
    shipmentDTO.shipping_address_street = shipment.shipping_address_street ?? null;
    shipmentDTO.shipping_address_city = shipment.shipping_address_city ?? null;
    shipmentDTO.shipping_address_postal_code = shipment.shipping_address_postal_code ?? null; 
    shipmentDTO.shipping_address_country = shipment.shipping_address_country ?? null;
    shipmentDTO.created_at = shipment.created_at?.toISOString() ?? '';
    shipmentDTO.updated_at = shipment.updated_at?.toISOString() ?? '';

    return shipmentDTO;
  }

  // Method untuk mendapatkan semua pengiriman
  async findAll(filters?: ShipmentFilters): Promise<ShipmentDTO[]> {
    const where: any = {};
    if (filters) {
        if (filters.order_id) where.order_id = filters.order_id;
        if (filters.status) where.status = filters.status;
        if (filters.courier_name) where.courier_name = Like(`%${filters.courier_name}%`);
    }
    const shipments = await this.shipmentRepository.find({ where });
    return shipments.map(s => this.mapShipmentToDTO(s)).filter((s): s is ShipmentDTO => s !== null);
  }

  // Method untuk mendapatkan pengiriman berdasarkan ID
  async findOneById(shipment_id: number): Promise<ShipmentDTO | null> {
    const shipment = await this.shipmentRepository.findOne({ where: { shipment_id } });
    return this.mapShipmentToDTO(shipment);
  }

  // Method untuk membuat pengiriman baru
  async create(input: CreateShipmentInput): Promise<ShipmentDTO> {
    // 1. Validasi Order
    const order = await this.orderService.findOneById(input.order_id);
    if (!order) {
      throw new BadRequestException(`Order with ID ${input.order_id} not found.`);
    }
    // Validasi: Pastikan pesanan sudah dibayar 
    if (order.payment_status !== 'PAID') {
      throw new BadRequestException(`Order with ID ${input.order_id} has not been paid yet.`);
    }

    const newShipment = this.shipmentRepository.create({
      order_id: input.order_id,
      status: input.status || 'PENDING', // Default status
      courier_name: input.courier_name ?? null,
      tracking_number: input.tracking_number ?? null,
      // Ambil snapshot alamat dari order
      shipping_address_street: order.shipping_address_street ?? null,
      shipping_address_city: order.shipping_address_city ?? null,
      shipping_address_postal_code: order.shipping_address_postal_code ?? null,
      shipping_address_country: order.shipping_address_country ?? null,
    });

    const savedShipment = await this.shipmentRepository.save(newShipment);

    // Update status pengiriman di OrderService
    await this.orderService.updateStatus(input.order_id, order.payment_status, 'SHIPPED'); // Set order shipping status

    return this.mapShipmentToDTO(savedShipment)!;
  }

  // Method untuk memperbarui pengiriman
  async update(shipment_id: number, input: UpdateShipmentInput): Promise<ShipmentDTO> {
    const shipment = await this.shipmentRepository.findOne({ where: { shipment_id } });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipment_id} not found.`);
    }

    Object.assign(shipment, input);
    // Konversi string tanggal dari input ke Date object jika ada
    if (input.shipment_date) shipment.shipment_date = new Date(input.shipment_date);
    if (input.delivery_date) shipment.delivery_date = new Date(input.delivery_date);

    const updatedShipment = await this.shipmentRepository.save(shipment);

    // Update status pengiriman di OrderService jika status berubah menjadi DELIVERED
    if (updatedShipment.status === 'DELIVERED') {
        const order = await this.orderService.findOneById(updatedShipment.order_id);
        if (order) {
            await this.orderService.updateStatus(order.order_id, order.payment_status ?? undefined, 'DELIVERED');
        }
    }
    return this.mapShipmentToDTO(updatedShipment)!;
  }

  // Method untuk menghapus pengiriman
  async delete(shipment_id: number): Promise<boolean> {
    const result = await this.shipmentRepository.delete(shipment_id);
    return (result.affected ?? 0) > 0;
  }
}
    // src/shipment/shipment.service.ts
    import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository, Like } from 'typeorm';
    import { Shipment } from './entity/shipment.entity';
    import { CreateShipmentInput, UpdateShipmentInput, ShipmentDTO, ShipmentFilters, OrderRefDTO } from './dto/shipment.dto'; 
    import axios from 'axios'; 

    @Injectable()
    export class ShipmentService {
      private readonly ORDER_SERVICE_URL = 'http://localhost:4002/graphql'; 

      constructor(
        @InjectRepository(Shipment, 'shipmentConnection')
        private shipmentRepository: Repository<Shipment>,
      ) {}

      // Helper untuk mengubah Shipment Entity menjadi ShipmentDTO
      private mapShipmentToDTO(shipment: Shipment | null): ShipmentDTO | null {
        if (!shipment) return null;

        const shipmentDTO = new ShipmentDTO();
        shipmentDTO.shipment_id = shipment.shipment_id;
        shipmentDTO.order_id = shipment.order_id;
        shipmentDTO.order = { order_id: shipment.order_id }; 
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
        // 1. Validasi Order dari Order Service (via HTTP/GraphQL)
        const orderQuery = `
            query GetOrder($orderId: ID!) {
                order(order_id: $orderId) {
                    order_id
                    payment_status
                    shipping_status
                    shipping_address_street
                    shipping_address_city
                    shipping_address_postal_code
                    shipping_address_country
                }
            }
        `;
        let order: any;
        try {
            const response = await axios.post(this.ORDER_SERVICE_URL, {
                query: orderQuery,
                variables: { orderId: input.order_id }
            });
            if (response.data.errors) {
                console.error('Order Service Errors:', response.data.errors);
                throw new InternalServerErrorException('Order Service returned errors.');
            }
            order = response.data.data.order;
            if (!order) {
                throw new BadRequestException(`Order with ID ${input.order_id} not found via Order Service.`);
            }
        } catch (error) {
            console.error('Error calling Order Service:', error.message);
            throw new InternalServerErrorException(`Failed to connect to Order Service: ${error.message}`);
        }

        // Validasi: Pastikan pesanan sudah dibayar (contoh validasi)
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

        // Update status pengiriman di OrderService (call updateStatus mutation via HTTP/GraphQL)
        const updateOrderStatusMutation = `
            mutation UpdateOrderStatus($orderId: ID!, $paymentStatus: String, $shippingStatus: String) {
                updateStatus(order_id: $orderId, payment_status: $paymentStatus, shipping_status: $shippingStatus) {
                    order_id
                    shipping_status
                }
            }
        `;
        try {
            await axios.post(this.ORDER_SERVICE_URL, {
                query: updateOrderStatusMutation,
                variables: { orderId: input.order_id, paymentStatus: order.payment_status, shippingStatus: 'SHIPPED' }
            });
        } catch (error) {
            console.error('Error updating order status in Order Service:', error.message);
            throw new InternalServerErrorException(`Failed to update order status: ${error.message}`);
        }

        return this.mapShipmentToDTO(savedShipment)!;
      }

      // Method untuk memperbarui pengiriman
      async update(shipment_id: number, input: UpdateShipmentInput): Promise<ShipmentDTO> {
        const shipment = await this.shipmentRepository.findOne({ where: { shipment_id } });
        if (!shipment) {
          throw new NotFoundException(`Shipment with ID ${shipment_id} not found.`);
        }

        Object.assign(shipment, input);
        if (input.shipment_date) shipment.shipment_date = new Date(input.shipment_date);
        if (input.delivery_date) shipment.delivery_date = new Date(input.delivery_date);

        const updatedShipment = await this.shipmentRepository.save(shipment);

        // Update status pengiriman di OrderService jika status berubah menjadi DELIVERED
        if (updatedShipment.status === 'DELIVERED') {
            const orderQuery = `
                query GetOrder($orderId: ID!) {
                    order(order_id: $orderId) {
                        order_id
                        payment_status
                        shipping_status
                    }
                }
            `;
            let order: any;
            try {
                const response = await axios.post(this.ORDER_SERVICE_URL, {
                    query: orderQuery,
                    variables: { orderId: updatedShipment.order_id }
                });
                if (response.data.errors) {
                    console.error('Order Service Errors during update:', response.data.errors);
                    throw new InternalServerErrorException('Order Service returned errors during update.');
                }
                order = response.data.data.order;
                if (order) {
                    const updateOrderStatusMutation = `
                        mutation UpdateOrderStatus($orderId: ID!, $paymentStatus: String, $shippingStatus: String) {
                            updateStatus(order_id: $orderId, payment_status: $paymentStatus, shipping_status: $shippingStatus) {
                                order_id
                                shipping_status
                            }
                        }
                    `;
                    await axios.post(this.ORDER_SERVICE_URL, {
                        query: updateOrderStatusMutation,
                        variables: { orderId: order.order_id, paymentStatus: order.payment_status, shippingStatus: 'DELIVERED' }
                    });
                }
            } catch (error) {
                console.error('Error calling Order Service for status update:', error.message);
                throw new InternalServerErrorException(`Failed to connect to Order Service for status update: ${error.message}`);
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
    
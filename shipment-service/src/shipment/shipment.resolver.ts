    // src/shipment/shipment.resolver.ts
    import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, ResolveReference } from '@nestjs/graphql';
    import { ShipmentService } from './shipment.service';
    import { ShipmentDTO, CreateShipmentInput, UpdateShipmentInput, ShipmentFilters, OrderRefDTO } from './dto/shipment.dto';
    import { NotFoundException } from '@nestjs/common';
    import axios from 'axios'; 

    @Resolver(() => ShipmentDTO)
    export class ShipmentResolver {
      constructor(private readonly shipmentService: ShipmentService) {}

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

      @ResolveReference()
      async resolveReference(reference: { __typename: string; shipment_id: string }): Promise<ShipmentDTO> {
        const shipment = await this.shipmentService.findOneById(parseInt(reference.shipment_id, 10));
        if (!shipment) {
          throw new NotFoundException(`Shipment with ID ${reference.shipment_id} not found.`);
        }
        return shipment;
      }

      // Field Resolver untuk Order di dalam ShipmentDTO
      @ResolveField('order', () => OrderRefDTO, { nullable: true })
      async getOrder(@Parent() shipment: ShipmentDTO): Promise<OrderRefDTO | null> {
        const orderQuery = `
            query GetOrderForShipment($orderId: ID!) {
                order(order_id: $orderId) {
                    order_id
                    payment_status
                    shipping_status
                }
            }
        `;
        let orderFromOrderService: any;
        try {
            const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://order-service:4002/graphql';
            console.log(`Connecting to Order Service at: ${orderServiceUrl}`);
            const response = await axios.post(orderServiceUrl, {
                query: orderQuery,
                variables: { orderId: shipment.order_id }
            });
            if (response.data.errors) {
                console.error('Order Service Errors in Shipment Resolver:', response.data.errors);
                // Jika Order Service mengembalikan error, kita bisa kembalikan null atau throw
                return null; 
            }
            orderFromOrderService = response.data.data.order;
            if (!orderFromOrderService) {
                return null; // Order tidak ditemukan di Order Service
            }
        } catch (error) {
            console.error('Error calling Order Service from Shipment Resolver:', error.message);
            return null; // Handle network error
        }

        return {
          order_id: orderFromOrderService.order_id,
          payment_status: orderFromOrderService.payment_status ?? null,
          shipping_status: orderFromOrderService.shipping_status ?? null,
        };
      }
    }
    
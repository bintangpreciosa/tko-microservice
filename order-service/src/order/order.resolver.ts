// src/order/order.resolver.ts
import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Int, ResolveReference } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { OrderDTO, CreateOrderInput, UpdateOrderInput, OrderFilters, OrderItemDTO, ProductReference, CustomerReference } from './dto/order.dto';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => OrderDTO)
export class OrderResolver {
  // Endpoint microservice lain 
  private readonly CUSTOMER_ADAPTER_SERVICE_URL = 'http://localhost:4006/graphql';
  private readonly PRODUCT_SERVICE_URL = 'http://localhost:4001/graphql';

  constructor(
    private readonly orderService: OrderService,
  ) {}

  // Query untuk mengambil satu pesanan berdasarkan ID
  @Query(() => OrderDTO, { nullable: true, description: 'Mengambil detail pesanan berdasarkan ID.' })
  async order(@Args('order_id', { type: () => ID }) order_id: number): Promise<OrderDTO | null> {
    return this.orderService.findOneById(order_id);
  }

  // Query untuk mengambil semua pesanan, dengan opsi filter
  @Query(() => [OrderDTO], { description: 'Mengambil daftar semua pesanan, bisa difilter.' })
  async allOrders(@Args('filters', { nullable: true }) filters?: OrderFilters): Promise<OrderDTO[]> {
    const orders = await this.orderService.findAll(filters);
    return orders.filter((o): o is OrderDTO => o !== null);
  }

  // Mutation untuk membuat pesanan baru
  @Mutation(() => OrderDTO, { description: 'Membuat pesanan baru.' })
  async createOrder(@Args('input') input: CreateOrderInput): Promise<OrderDTO> {
    return await this.orderService.create(input);
  }

  // Mutation untuk memperbarui status pesanan
  @Mutation(() => OrderDTO, { description: 'Memperbarui status pesanan.' })
  async updateStatus(
    @Args('order_id', { type: () => ID }) order_id: number,
    @Args('payment_status', { nullable: true }) payment_status?: string,
    @Args('shipping_status', { nullable: true }) shipping_status?: string,
  ): Promise<OrderDTO> {
    return await this.orderService.updateStatus(order_id, payment_status, shipping_status);
  }

  // Mutation untuk menghapus pesanan
  @Mutation(() => Boolean, { description: 'Menghapus pesanan berdasarkan ID.' })
  async deleteOrder(@Args('order_id', { type: () => ID }) order_id: number): Promise<boolean> {
    return this.orderService.delete(order_id);
  }

  // @ResolveReference untuk OrderDTO (agar Gateway tahu cara mengambil Order)
  @ResolveReference()
  async resolveReference(reference: { __typename: string; order_id: string }): Promise<OrderDTO> {
    const order = await this.orderService.findOneById(parseInt(reference.order_id, 10));
    if (!order) {
      throw new NotFoundException(`Order with ID ${reference.order_id} not found.`);
    }
    return order;
  }

  // Field Resolver untuk Customer di dalam OrderDTO
  @ResolveField('customer', () => CustomerReference)
async getCustomer(@Parent() order: OrderDTO): Promise<CustomerReference> {
  return { id: order.customer_crm_id }; // penting
}
  @ResolveField('product', () => ProductReference)
async getProduct(@Parent() orderItem: OrderItemDTO): Promise<ProductReference> {
  return { product_id: orderItem.product_id }; // penting
}
}

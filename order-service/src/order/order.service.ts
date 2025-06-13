// src/order/order.service.ts
import { 
  Inject, 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import axios from 'axios';
import { OrderDTO, OrderItemDTO, CreateOrderInput, UpdateOrderInput, OrderFilters, CreateOrderItemInput, ProductReference, CustomerReference } from './dto/order.dto';

@Injectable()
export class OrderService {
  // Endpoint microservice lain
  private readonly PRODUCT_SERVICE_URL: string;
  private readonly CUSTOMER_SERVICE_URL: string;

  constructor(
    @InjectRepository(Order, 'orderConnection')
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem, 'orderConnection')
    private orderItemRepository: Repository<OrderItem>,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    this.PRODUCT_SERVICE_URL = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://product-service:4001/graphql';
    this.CUSTOMER_SERVICE_URL = this.configService.get<string>('CUSTOMER_SERVICE_URL') || 'http://customer-adapter-service:4006/graphql';
    
    console.log('Product Service URL:', this.PRODUCT_SERVICE_URL);
    console.log('Customer Service URL:', this.CUSTOMER_SERVICE_URL);
  }

  // Helper untuk menghitung total harga keranjang
  private calculateCartTotal(cartItems: OrderItem[]): number {
    return cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  // Helper untuk memetakan Order Entity ke OrderDTO
  private mapOrderToDTO(order: Order): OrderDTO | null {
    if (!order) return null;

    const orderDTO = new OrderDTO();
    orderDTO.order_id = order.order_id;
    orderDTO.customer_crm_id = order.customer_crm_id;
    orderDTO.customer = { id: order.customer_crm_id };
    orderDTO.order_date = order.order_date ? order.order_date.toISOString() : '';
    orderDTO.total_price = order.total_price;
    orderDTO.payment_status = order.payment_status;
    orderDTO.shipping_status = order.shipping_status;
    
    orderDTO.shipping_address_street = order.shipping_address_street ?? null;
    orderDTO.shipping_address_city = order.shipping_address_city ?? null;
    orderDTO.shipping_address_postal_code = order.shipping_address_postal_code ?? null;
    orderDTO.shipping_address_country = order.shipping_address_country ?? null;

    orderDTO.created_at = order.created_at ? order.created_at.toISOString() : '';
    orderDTO.updated_at = order.updated_at ? order.updated_at.toISOString() : undefined;

    if (order.order_items && order.order_items.length > 0) {
        orderDTO.order_items = order.order_items.map(item => ({
            order_item_id: item.order_item_id,
            order_id: item.order_id,
            product_id: item.product_id,
            product: { product_id: item.product_id },
            product_name: item.product_name, 
            quantity: item.quantity,
            price: item.price, 
        }));
    } else {
        orderDTO.order_items = [];
    }

    return orderDTO;
  }

  // Method untuk mendapatkan semua pesanan dengan filter
  async findAll(filters?: OrderFilters): Promise<OrderDTO[]> {
    const where: any = {};
    if (filters) {
      if (filters.customer_crm_id) {
        where.customer_crm_id = filters.customer_crm_id;
      }
      if (filters.payment_status) {
        where.payment_status = filters.payment_status;
      }
      if (filters.shipping_status) {
        where.shipping_status = filters.shipping_status;
      }
    }
    
    const orders = await this.orderRepository.find({
        where,
        relations: ['order_items'],
    });

    return orders.map(order => this.mapOrderToDTO(order)).filter((o): o is OrderDTO => o !== null);
  }

  // Method untuk mendapatkan pesanan berdasarkan ID
  async findOneById(order_id: number): Promise<OrderDTO | null> {
    const order = await this.orderRepository.findOne({
        where: { order_id },
        relations: ['order_items'],
    });
    if (!order) {
      return null;
    }
    return this.mapOrderToDTO(order);
  }

  // Method untuk membuat pesanan baru
  async create(input: CreateOrderInput): Promise<OrderDTO> {
    // 1. Validasi Customer dari Customer Adapter Service (via HTTP/GraphQL)
    const customerQuery = `
        query GetCustomerFromAdapter($id: ID!) {
            customer(id: $id) {
                id
                name
                email
                address
                city
                postal_code
                country
            }
        }
    `;
    let customer: any;
    try {
        const response = await axios.post(this.CUSTOMER_SERVICE_URL, {
            query: customerQuery,
            variables: { id: input.customer_crm_id }
        });
        if (response.data.errors) {
            console.error('Customer Adapter Errors:', response.data.errors);
            throw new InternalServerErrorException('Customer Adapter returned errors.');
        }
        customer = response.data.data.customer;
        if (!customer) {
            throw new BadRequestException(`Customer with ID ${input.customer_crm_id} not found via adapter.`);
        }
    } catch (error) {
        console.error('Error calling Customer Adapter:', error.message);
        throw new InternalServerErrorException(`Failed to connect to Customer Adapter: ${error.message}`);
    }

    let total_price = 0;
    const orderItems: OrderItem[] = [];

    // 2. Validasi Produk dan Ambil Info Terbaru dari Product Service (via HTTP/GraphQL)
    for (const itemInput of input.items) {
      const productQuery = `
          query GetProduct($productId: ID!) {
              product(product_id: $productId) {
                  product_id
                  name
                  price
                  stock
              }
          }
      `;
      let product: any;
      try {
          const response = await axios.post(this.PRODUCT_SERVICE_URL, {
              query: productQuery,
              variables: { productId: itemInput.product_id }
          });
          if (response.data.errors) {
              console.error('Product Service Errors:', response.data.errors);
              throw new InternalServerErrorException('Product Service returned errors.');
          }
          product = response.data.data.product;
          if (!product || product.stock < itemInput.quantity) {
              throw new BadRequestException(`Product (ID: ${itemInput.product_id}) is out of stock or not found.`);
          }
      } catch (error) {
          console.error('Error calling Product Service:', error.message);
          throw new InternalServerErrorException(`Failed to connect to Product Service: ${error.message}`);
      }
      
      const orderItem = new OrderItem();
      orderItem.product_id = itemInput.product_id;
      orderItem.product_name = product.name; 
      orderItem.quantity = itemInput.quantity;
      orderItem.price = product.price; 
      orderItems.push(orderItem);

      total_price += itemInput.quantity * product.price;

      // Kurangi stok produk (call Product Service update mutation via HTTP/GraphQL)
      const updateProductMutation = `
          mutation UpdateProduct($productId: ID!, $input: UpdateProductInput!) {
              updateProduct(product_id: $productId, input: $input) {
                  product_id
                  stock
              }
          }
      `;
      try {
        await axios.post(this.PRODUCT_SERVICE_URL, {
            query: updateProductMutation,
            variables: { productId: product.product_id, input: { stock: product.stock - itemInput.quantity } }
        });
      } catch (error) {
          console.error('Error updating stock in Product Service:', error.message);
          throw new InternalServerErrorException(`Failed to update product stock: ${error.message}`);
      }
    }

    // 3. Buat Entitas Order
    const newOrder = new Order();
    newOrder.customer_crm_id = input.customer_crm_id;
    newOrder.total_price = total_price;
    newOrder.payment_status = 'PENDING';
    newOrder.shipping_status = 'PENDING';
    
    newOrder.shipping_address_street = input.shipping_address_street ?? customer.address ?? null;
    newOrder.shipping_address_city = input.shipping_address_city ?? customer.city ?? null;
    newOrder.shipping_address_postal_code = input.shipping_address_postal_code ?? customer.postal_code ?? null;
    newOrder.shipping_address_country = input.shipping_address_country ?? customer.country ?? null;
    
    newOrder.order_items = orderItems;

    const savedOrder = await this.orderRepository.save(newOrder);
    
    return this.mapOrderToDTO(savedOrder)!;
  }

  // Method untuk memperbarui status pesanan
  async updateStatus(order_id: number, payment_status?: string, shipping_status?: string | null): Promise<OrderDTO> {
    const order = await this.orderRepository.findOne({ where: { order_id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found.`);
    }

    if (payment_status !== undefined) {
      order.payment_status = payment_status;
    }
    if (shipping_status !== undefined) {
      order.shipping_status = shipping_status;
    }

    const updatedOrder = await this.orderRepository.save(order);
    
    return this.mapOrderToDTO(updatedOrder)!;
  }

  // Method untuk menghapus pesanan (bersama itemnya)
  async delete(order_id: number): Promise<boolean> {
    // Hapus order items terlebih dahulu
    await this.orderItemRepository.delete({ order_id });
    
    // Kemudian hapus order
    const result = await this.orderRepository.delete(order_id);
    return (result.affected ?? 0) > 0;
  }
}

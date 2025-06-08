// src/payment/payment.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity';
import { CreatePaymentInput, UpdatePaymentInput, PaymentDTO, OrderRefDTO } from './dto/payment.dto'; // PASTIKAN OrderRefDTO diimpor
import axios from 'axios'; // Import axios untuk komunikasi antar-service

@Injectable()
export class PaymentService {
  // Endpoint microservice lain (sesuaikan port jika berbeda)
  private readonly ORDER_SERVICE_URL = 'http://localhost:4002/graphql'; // Order Service

  constructor(
    @InjectRepository(Payment, 'paymentConnection')
    private paymentRepository: Repository<Payment>,
  ) {}

  // Helper untuk memetakan Payment Entity ke PaymentDTO
  private mapPaymentToDTO(payment: Payment | null): PaymentDTO | null {
    if (!payment) return null;

    const paymentDTO = new PaymentDTO();
    paymentDTO.payment_id = payment.payment_id;
    paymentDTO.order_id = payment.order_id;
    paymentDTO.order = { order_id: payment.order_id };
    paymentDTO.amount = payment.amount;
    paymentDTO.payment_method = payment.payment_method;
    paymentDTO.payment_status = payment.payment_status;
    paymentDTO.payment_date = payment.payment_date ? payment.payment_date.toISOString() : '';

    return paymentDTO;
  }

  // Method untuk mendapatkan semua pembayaran
  async findAll(): Promise<PaymentDTO[]> {
    const payments = await this.paymentRepository.find();
    return payments.map(payment => this.mapPaymentToDTO(payment)).filter((p): p is PaymentDTO => p !== null);
  }

  // Method untuk mendapatkan pembayaran berdasarkan ID
  async findOneById(payment_id: number): Promise<PaymentDTO | null> {
    const payment = await this.paymentRepository.findOne({ where: { payment_id } });
    return this.mapPaymentToDTO(payment);
  }

  // Method untuk membuat pembayaran baru
  async create(input: CreatePaymentInput): Promise<PaymentDTO> {
    // 1. Validasi Order dari Order Service (via HTTP/GraphQL)
    const orderQuery = `
        query GetOrder($orderId: ID!) {
            order(order_id: $orderId) {
                order_id
                total_price
                payment_status
                shipping_status
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

    // Validasi: pastikan pembayaran tidak melebihi total_price order
    if (input.amount > order.total_price) {
      throw new BadRequestException(`Payment amount ${input.amount} exceeds order total ${order.total_price}.`);
    }
    // Validasi: pastikan order belum dibayar lunas
    if (order.payment_status === 'PAID') {
      throw new BadRequestException(`Order with ID ${input.order_id} has already been paid.`);
    }
    
    const newPayment = this.paymentRepository.create({
      order_id: input.order_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_status: 'PENDING', // Status awal
    });
    
    const savedPayment = await this.paymentRepository.save(newPayment);

    // Update status pembayaran di OrderService (call updateStatus mutation via HTTP/GraphQL)
    const updateOrderStatusMutation = `
        mutation UpdateOrderStatus($orderId: ID!, $paymentStatus: String, $shippingStatus: String) {
            updateStatus(order_id: $orderId, payment_status: $paymentStatus, shipping_status: $shippingStatus) {
                order_id
                payment_status
            }
        }
    `;
    try {
        await axios.post(this.ORDER_SERVICE_URL, {
            query: updateOrderStatusMutation,
            variables: { orderId: input.order_id, paymentStatus: 'PAID', shippingStatus: order.shipping_status }
        });
    } catch (error) {
        console.error('Error updating order status in Order Service:', error.message);
        throw new InternalServerErrorException(`Failed to update order status: ${error.message}`);
    }

    return this.mapPaymentToDTO(savedPayment)!;
  }

  // Method untuk memperbarui status pembayaran
  async updateStatus(payment_id: number, payment_status: string): Promise<PaymentDTO> {
      const payment = await this.paymentRepository.findOne({ where: { payment_id } });
      if (!payment) {
          throw new NotFoundException(`Payment with ID ${payment_id} not found.`);
      }
      payment.payment_status = payment_status;
      const updatedPayment = await this.paymentRepository.save(payment);

      // Update status pembayaran di OrderService juga jika pembayaran menjadi SUKSES
      if (payment_status === 'SUCCESS') {
          // Ambil detail order dari Order Service
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
                  variables: { orderId: payment.order_id }
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
                              payment_status
                          }
                      }
                  `;
                  await axios.post(this.ORDER_SERVICE_URL, {
                      query: updateOrderStatusMutation,
                      variables: { orderId: order.order_id, paymentStatus: 'PAID', shippingStatus: order.shipping_status }
                  });
              }
          } catch (error) {
              console.error('Error calling Order Service for status update:', error.message);
              throw new InternalServerErrorException(`Failed to connect to Order Service for status update: ${error.message}`);
          }
      }

      return this.mapPaymentToDTO(updatedPayment)!;
  }

  // Method untuk menghapus pembayaran
  async delete(payment_id: number): Promise<boolean> {
    const result = await this.paymentRepository.delete(payment_id);
    return (result.affected ?? 0) > 0;
  }
}

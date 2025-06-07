// src/payment/payment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity'; 
import { CreatePaymentInput, UpdatePaymentInput, PaymentDTO } from './dto/payment.dto'; 
import { OrderService } from '../order/order.service'; 

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment, 'paymentConnection') 
    private paymentRepository: Repository<Payment>,
    private orderService: OrderService, 
  ) {}

  // Helper untuk mengubah Payment Entity menjadi PaymentDTO
  private mapPaymentToDTO(payment: Payment | null): PaymentDTO | null {
    if (!payment) return null;

    const paymentDTO = new PaymentDTO();
    paymentDTO.payment_id = payment.payment_id;
    paymentDTO.order_id = payment.order_id;
    paymentDTO.amount = payment.amount;
    paymentDTO.payment_method = payment.payment_method;
    paymentDTO.payment_status = payment.payment_status;
    paymentDTO.payment_date = payment.payment_date ? payment.payment_date.toISOString() : '';

    return paymentDTO;
  }

  // Method untuk mendapatkan semua pembayaran
  async findAll(): Promise<PaymentDTO[]> {
    const payments = await this.paymentRepository.find({ }); // Load relasi order juga
    return payments.map(payment => this.mapPaymentToDTO(payment)).filter((p): p is PaymentDTO => p !== null);
  }

  // Method untuk mendapatkan pembayaran berdasarkan ID
  async findOneById(payment_id: number): Promise<PaymentDTO | null> {
    const payment = await this.paymentRepository.findOne({ where: { payment_id } });
    return this.mapPaymentToDTO(payment);
  }

  // Method untuk membuat pembayaran baru
  async create(input: CreatePaymentInput): Promise<PaymentDTO> {
    // Validasi Order (ini akan memanggil OrderService)
    const order = await this.orderService.findOneById(input.order_id);
    if (!order) {
      throw new BadRequestException(`Order with ID ${input.order_id} not found.`);
    }
    if (input.amount > order.total_price) {
      throw new BadRequestException(`Payment amount ${input.amount} exceeds order total ${order.total_price}.`);
    }
    if (order.payment_status === 'PAID') {
      throw new BadRequestException(`Order with ID ${input.order_id} has already been paid.`);
    }

    const newPayment = this.paymentRepository.create({
      order_id: input.order_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_status: 'PENDING',
    }); 

    const savedPayment = await this.paymentRepository.save(newPayment);

    // Update status pembayaran di OrderService
    await this.orderService.updateStatus(input.order_id, 'PAID', order.shipping_status); // Set order status menjadi PAID

    return this.mapPaymentToDTO(savedPayment)!;
  }

  // Method untuk memperbarui status pembayaran
  async updateStatus(payment_id: number, payment_status: string): Promise<PaymentDTO> {
      const payment = await this.paymentRepository.findOne({ where: { payment_id } }); // HAPUS relations: ['order']
      if (!payment) {
          throw new NotFoundException(`Payment with ID ${payment_id} not found.`);
      }
      payment.payment_status = payment_status;
      const updatedPayment = await this.paymentRepository.save(payment);

      // Jika perlu update OrderService, ambil OrderDTO dulu
      if (payment_status === 'SUCCESS') { // Asumsi hanya perlu order_id dan shipping_status
          const order = await this.orderService.findOneById(payment.order_id);
          if (order) { 
              await this.orderService.updateStatus(order.order_id, 'PAID', order.shipping_status);
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
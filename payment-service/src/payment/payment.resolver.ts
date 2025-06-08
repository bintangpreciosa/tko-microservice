// src/payment/payment.resolver.ts
import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, ResolveReference } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { PaymentDTO, CreatePaymentInput, UpdatePaymentInput, OrderRefDTO } from './dto/payment.dto'; // PASTIKAN OrderRefDTO diimpor
import { NotFoundException } from '@nestjs/common';

@Resolver(() => PaymentDTO)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  // Query untuk mengambil satu pembayaran berdasarkan ID
  @Query(() => PaymentDTO, { nullable: true, description: 'Mengambil detail pembayaran berdasarkan ID.' })
  async payment(@Args('payment_id', { type: () => ID }) payment_id: number): Promise<PaymentDTO | null> {
    return this.paymentService.findOneById(payment_id);
  }

  // Query untuk mengambil semua pembayaran
  @Query(() => [PaymentDTO], { description: 'Mengambil daftar semua pembayaran.' })
  async allPayments(): Promise<PaymentDTO[]> {
    const payments = await this.paymentService.findAll();
    return payments.filter((p): p is PaymentDTO => p !== null);
  }

  // Mutation untuk membuat pembayaran baru
  @Mutation(() => PaymentDTO, { description: 'Membuat pembayaran baru.' })
  async createPayment(@Args('input') input: CreatePaymentInput): Promise<PaymentDTO> {
    return this.paymentService.create(input);
  }

  // Mutation untuk memperbarui status pembayaran
  @Mutation(() => PaymentDTO, { description: 'Memperbarui status pembayaran.' })
  async updatePaymentStatus(
    @Args('payment_id', { type: () => ID }) payment_id: number,
    @Args('payment_status') payment_status: string,
  ): Promise<PaymentDTO> {
    return this.paymentService.updateStatus(payment_id, payment_status);
  }

  // Mutation untuk menghapus pembayaran
  @Mutation(() => Boolean, { description: 'Menghapus pembayaran berdasarkan ID.' })
  async deletePayment(@Args('payment_id', { type: () => ID }) payment_id: number): Promise<boolean> {
    return this.paymentService.delete(payment_id);
  }

  // @ResolveReference untuk PaymentDTO (agar Gateway tahu cara mengambil Payment)
  @ResolveReference()
  async resolveReference(reference: { __typename: string; payment_id: string }): Promise<PaymentDTO> {
    const payment = await this.paymentService.findOneById(parseInt(reference.payment_id, 10));
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${reference.payment_id} not found.`);
    }
    return payment;
  }

  // Field Resolver untuk Order di dalam PaymentDTO
  @ResolveField('order', () => OrderRefDTO, { nullable: true }) 
  async getOrder(@Parent() payment: PaymentDTO): Promise<OrderRefDTO | null> {
    return { order_id: payment.order_id };
  }
}

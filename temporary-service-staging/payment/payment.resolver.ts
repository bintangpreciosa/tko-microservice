// src/payment/payment.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PaymentService } from './payment.service'; 
import { PaymentDTO, CreatePaymentInput, UpdatePaymentInput } from './dto/payment.dto'; 

@Resolver(() => PaymentDTO) // Mengaitkan resolver ini dengan tipe PaymentDTO GraphQL
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {} // Inject PaymentService

  // Query untuk mengambil satu pembayaran berdasarkan ID
  @Query(() => PaymentDTO, { nullable: true, description: 'Mengambil detail pembayaran berdasarkan ID.' })
  async payment(@Args('payment_id', { type: () => ID }) payment_id: number): Promise<PaymentDTO | null> {
    return this.paymentService.findOneById(payment_id);
  }

  // Query untuk mengambil semua pembayaran
  @Query(() => [PaymentDTO], { description: 'Mengambil daftar semua pembayaran.' })
  async allPayments(): Promise<PaymentDTO[]> {
    const payments = await this.paymentService.findAll();
    // Filter nulls karena mapPaymentToDTO bisa mengembalikan null
    return payments.filter((p): p is PaymentDTO => p !== null);
  }

  // Mutation untuk membuat pembayaran baru
  @Mutation(() => PaymentDTO, { description: 'Membuat pembayaran baru.' })
  async createPayment(@Args('input') input: CreatePaymentInput): Promise<PaymentDTO> {
    // Assertion non-null karena PaymentService.create dijamin mengembalikan PaymentDTO
    return await this.paymentService.create(input);
  }

  // Mutation untuk memperbarui status pembayaran
  @Mutation(() => PaymentDTO, { description: 'Memperbarui status pembayaran.' })
  async updatePaymentStatus(
    @Args('payment_id', { type: () => ID }) payment_id: number,
    @Args('payment_status') payment_status: string,
  ): Promise<PaymentDTO> {
    // Assertion non-null karena PaymentService.updateStatus dijamin mengembalikan PaymentDTO
    return await this.paymentService.updateStatus(payment_id, payment_status);
  }

  // Mutation untuk menghapus pembayaran
  @Mutation(() => Boolean, { description: 'Menghapus pembayaran berdasarkan ID.' })
  async deletePayment(@Args('payment_id', { type: () => ID }) payment_id: number): Promise<boolean> {
    return this.paymentService.delete(payment_id);
  }
}
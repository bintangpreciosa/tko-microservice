// src/payment/dto/payment.dto.ts
import { Field, ID, ObjectType, InputType, Float } from '@nestjs/graphql';

@ObjectType()
export class PaymentDTO {
  @Field(() => ID)
  payment_id: number;

  @Field(() => ID)
  order_id: number;

  @Field(() => Float)
  amount: number;

  @Field()
  payment_method: string;

  @Field()
  payment_status: string;

  @Field()
  payment_date: string; // ISO string
}

@InputType()
export class CreatePaymentInput {
  @Field(() => ID)
  order_id: number;

  @Field(() => Float)
  amount: number;

  @Field()
  payment_method: string;
}

@InputType()
export class UpdatePaymentInput {
    @Field(() => ID)
    payment_id: number;

    @Field({ nullable: true })
    payment_status?: string;
}
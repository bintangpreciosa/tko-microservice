// src/payment/dto/payment.dto.ts
import { Field, ID, ObjectType, InputType, Float, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "order_id")') 
export class OrderRefDTO {
  @Field(() => ID)
  @Directive('@external') 
  order_id: number;

  @Field(() => String, { nullable: true })
  payment_status?: string;
}


@ObjectType()
@Directive('@key(fields: "payment_id")') 
export class PaymentDTO {
  @Field(() => ID)
  payment_id: number;

  @Field(() => ID)
  order_id: number;

  @Field(() => OrderRefDTO, { nullable: true }) 
  order?: OrderRefDTO;

  @Field(() => Float)
  amount: number;

  @Field()
  payment_method: string;

  @Field()
  payment_status: string;

  @Field()
  payment_date: string; 
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

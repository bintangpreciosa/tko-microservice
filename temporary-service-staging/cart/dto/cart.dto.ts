// src/cart/dto/cart.dto.ts
import { Field, ID, ObjectType, InputType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class CartItemDTO {
  @Field(() => ID)
  cart_item_id: number;

  @Field(() => ID)
  cart_id: number;

  @Field(() => Int)
  product_id: number;

  @Field()
  product_name: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}

@ObjectType()
export class CartDTO {
  @Field(() => ID)
  cart_id: number;

  @Field(() => String, { nullable: true })
  customer_crm_id?: string | null;

  @Field(() => String, { nullable: true })
  session_id?: string | null; // Untuk keranjang anonim

  @Field(() => String)
  created_at: string;

  @Field(() => String)
  updated_at: string;

  @Field(() => [CartItemDTO])
  cart_items: CartItemDTO[];

  @Field(() => Float)
  total_price: number; // Field tambahan di DTO untuk total harga keranjang
}

@InputType()
export class AddToCartInput {
  @Field(() => Int)
  product_id: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => String, { nullable: true })
  customer_crm_id?: string; // Opsional, jika pengguna login

  @Field(() => String, { nullable: true })
  session_id?: string; // Opsional, untuk pengguna anonim
}

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  cart_item_id: number;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class RemoveFromCartInput {
  @Field(() => ID)
  cart_item_id: number;
}

@InputType()
export class GetCartInput {
  @Field(() => String, { nullable: true })
  customer_crm_id?: string;

  @Field(() => String, { nullable: true })
  session_id?: string;
}
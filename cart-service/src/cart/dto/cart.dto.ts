// src/cart/dto/cart.dto.ts
import { Field, ID, ObjectType, InputType, Int, Float, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "product_id")')
export class ProductReference {
  @Field(() => ID)
  @Directive('@external') 
  product_id: number;


  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  stock?: number;
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class CustomerReference {
  @Field(() => ID)
  @Directive('@external') 
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;
}


@ObjectType()
@Directive('@key(fields: "cart_item_id")')
export class CartItemDTO {
  @Field(() => ID)
  cart_item_id: number;

  @Field(() => Int)
  cart_id: number;

  @Field(() => Int)
  product_id: number;

  @Field(() => ProductReference)
  product: ProductReference;

  @Field()
  product_name: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}

@ObjectType()
@Directive('@key(fields: "cart_id")')
export class CartDTO {
  @Field(() => ID)
  cart_id: number;

  @Field(() => String, { nullable: true })
  customer_crm_id?: string | null;

  @Field(() => CustomerReference, { nullable: true })
  customer?: CustomerReference | null;

  @Field(() => String, { nullable: true })
  session_id?: string | null;

  @Field(() => String)
  created_at: string;

  @Field(() => String)
  updated_at: string;

  @Field(() => [CartItemDTO])
  cart_items: CartItemDTO[];

  @Field(() => Float)
  total_price: number;
}

@InputType()
export class AddToCartInput {
  @Field(() => Int)
  product_id: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => String, { nullable: true })
  customer_crm_id?: string;

  @Field(() => String, { nullable: true })
  session_id?: string;
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
  @Field(() => ID, { nullable: true })
  cart_id?: number;

  @Field(() => String, { nullable: true })
  customer_crm_id?: string;

  @Field(() => String, { nullable: true })
  session_id?: string;
}

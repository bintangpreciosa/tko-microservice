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
  @Directive('@external')
  name?: string;

  @Field(() => Float, { nullable: true })
  @Directive('@external')
  price?: number;

  @Field(() => Int, { nullable: true })
  @Directive('@external')
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
  @Directive('@external')
  name?: string;

  @Field(() => String, { nullable: true })
  @Directive('@external')
  email?: string;
}


@ObjectType()
@Directive('@key(fields: "cart_item_id")')
export class CartItemDTO {
  @Field(() => ID)
  cart_item_id: number;

  @Field(() => Int)
  // @Directive('@shareable')
  cart_id: number;

  @Field(() => Int)
  // @Directive('@shareable')
  product_id: number;

  @Field(() => ProductReference)
  product: ProductReference;

  @Field()
  // @Directive('@shareable')
  product_name: string;

  @Field(() => Int)
  // @Directive('@shareable')
  quantity: number;

  @Field(() => Float)
  // @Directive('@shareable')
  price: number;

  @Field(() => String, { nullable: true })
  @Directive('@requires(fields: "product { name price stock }")') 
  productDetailSummary?: string; 

}

@ObjectType()
@Directive('@key(fields: "cart_id")')
export class CartDTO {
  @Field(() => ID)
  cart_id: number;

  @Field(() => String, { nullable: true })
  // @Directive('@shareable')
  customer_crm_id?: string | null;

  @Field(() => CustomerReference, { nullable: true })
  customer?: CustomerReference | null;

  @Field(() => String, { nullable: true })
  // @Directive('@shareable')
  session_id?: string | null;

  @Field(() => String)
  // @Directive('@shareable')
  created_at: string;

  @Field(() => String)
  // @Directive('@shareable')
  updated_at: string;

  @Field(() => [CartItemDTO])
  cart_items: CartItemDTO[];

  @Field(() => Float)
  // @Directive('@shareable')
  total_price: number;

  @Field(() => String, { nullable: true })
  @Directive('@requires(fields: "customer { name email }")') 
  customerContactInfo?: string; 

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

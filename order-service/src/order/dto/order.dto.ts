// src/order/dto/order.dto.ts
import { Field, ID, ObjectType, InputType, Float, Int, Directive } from '@nestjs/graphql';

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
@Directive('@key(fields: "order_item_id")')
export class OrderItemDTO {
  @Field(() => ID)
  order_item_id: number;

  @Field(() => Int)
  order_id: number;

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

  @Field(() => String, { nullable: true })
  @Directive('@requires(fields: "product { name price stock }")') 
  productDisplayInfo?: string; 
 
  @Field(() => String, { nullable: true })
  @Directive('@requires(fields: "product { stock }")') 
  stockStatusMessage?: string;
}

@ObjectType()
@Directive('@key(fields: "order_id")')
export class OrderDTO {
  @Field(() => ID)
  order_id: number;

  @Field(() => String) 
  @Directive('@shareable') 
  customer_crm_id: string;

  @Field(() => CustomerReference) 
  @Directive('@shareable') 
  customer: CustomerReference; 

  @Field(() => String)
  @Directive('@shareable')
  order_date: string;

  @Field(() => Float)
  @Directive('@shareable')
  total_price: number;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  payment_status?: string | null;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  shipping_status?: string | null;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  shipping_address_street?: string | null;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  shipping_address_city?: string | null;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  shipping_address_postal_code?: string | null;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  shipping_address_country?: string | null;

  @Field(() => String)
  @Directive('@shareable')
  created_at: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  updated_at?: string;

  @Field(() => [OrderItemDTO]) 
  order_items: OrderItemDTO[];

  @Field(() => String, { nullable: true })
  @Directive('@requires(fields: "customer { name email }")')
  customerFullNameAndEmail?: string;
}


@InputType()
export class CreateOrderItemInput { 
  @Field(() => Int)
  product_id: number;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderInput { 
  @Field(() => String) 
  customer_crm_id: string;

  @Field({ nullable: true })
  shipping_address_street?: string;

  @Field({ nullable: true })
  shipping_address_city?: string;

  @Field({ nullable: true })
  shipping_address_postal_code?: string;

  @Field({ nullable: true })
  shipping_address_country?: string;

  @Field(() => [CreateOrderItemInput]) 
  items: CreateOrderItemInput[];
}

@InputType()
export class UpdateOrderInput {
  @Field({ nullable: true })
  payment_status?: string;

  @Field({ nullable: true })
  shipping_status?: string;

  @Field({ nullable: true })
  shipping_address_street?: string;

  @Field({ nullable: true })
  shipping_address_city?: string;

  @Field({ nullable: true })
  shipping_address_postal_code?: string;

  @Field({ nullable: true })
  shipping_address_country?: string;
}

@InputType()
export class OrderFilters {
  @Field(() => String, { nullable: true })
  customer_crm_id?: string;

  @Field(() => String, { nullable: true })
  payment_status?: string;

  @Field(() => String, { nullable: true })
  shipping_status?: string;
}
// src/order/dto/order.dto.ts
import { Field, ID, ObjectType, InputType, Float, Int, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "product_id")')
export class ProductReference {
 @Field(() => ID)
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
      id: string; 

      @Field(() => String, { nullable: true })
      name?: string;

      @Field(() => String, { nullable: true })
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
      productDisplayInfo?: string; 
    }

    @ObjectType()
    @Directive('@key(fields: "order_id")')
    export class OrderDTO {
      @Field(() => ID)
      order_id: number;

      @Field(() => String) 
      customer_crm_id: string;

      @Field(() => CustomerReference) 
      customer: CustomerReference; 

      @Field(() => String)
      order_date: string;

      @Field(() => Float)
      total_price: number;

      @Field(() => String, { nullable: true })
      payment_status?: string | null;

      @Field(() => String, { nullable: true })
      shipping_status?: string | null;

      @Field(() => String, { nullable: true })
      shipping_address_street?: string | null;

      @Field(() => String, { nullable: true })
      shipping_address_city?: string | null;

      @Field(() => String, { nullable: true })
      shipping_address_postal_code?: string | null;

      @Field(() => String, { nullable: true })
      shipping_address_country?: string | null;

      @Field(() => String)
      created_at: string;

      @Field(() => String, { nullable: true })
      updated_at?: string;

      @Field(() => [OrderItemDTO]) 
      order_items: OrderItemDTO[];

      @Field(() => String, { nullable: true })
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
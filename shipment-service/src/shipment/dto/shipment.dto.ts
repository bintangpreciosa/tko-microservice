    // src/shipment/dto/shipment.dto.ts
    import { Field, ID, ObjectType, InputType, Int, Directive } from '@nestjs/graphql';

    @ObjectType()
    @Directive('@extends')
    @Directive('@key(fields: "order_id")')
    export class OrderRefDTO {
      @Field(() => ID)
      @Directive('@external')
      order_id: number;

      @Field(() => String, { nullable: true })
      @Directive('@shareable')
      payment_status?: string;

      @Field(() => String, { nullable: true })
      @Directive('@shareable')
      shipping_status?: string;
    }

    @ObjectType()
    @Directive('@key(fields: "shipment_id")') 
    export class ShipmentDTO {
      @Field(() => ID)
      shipment_id: number;

      @Field(() => ID)
      @Directive('@shareable')
      order_id: number; 

      @Field(() => OrderRefDTO, { nullable: true }) 
      @Directive('@shareable')
      order?: OrderRefDTO; 

      @Field(() => String, { nullable: true })
      @Directive('@shareable')
      shipment_date?: string | null; 

      @Field(() => String, { nullable: true })
      @Directive('@shareable')
      delivery_date?: string | null; 

      @Field(() => String)
      @Directive('@shareable')
      status: string;

      @Field(() => String, { nullable: true })
      @Directive('@shareable')
      courier_name?: string | null;

      @Field(() => String, { nullable: true })
      @Directive('@shareable')
      tracking_number?: string | null;

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

      @Field(() => String)
      @Directive('@shareable')
      updated_at: string;
    }

    @InputType()
    export class CreateShipmentInput {
      @Field(() => ID)
      order_id: number;

      @Field({ nullable: true })
      status?: string; // Default PENDING

      @Field({ nullable: true })
      courier_name?: string;

      @Field({ nullable: true })
      tracking_number?: string;
    }

    @InputType()
    export class UpdateShipmentInput {
      // @Field(() => ID)
      // shipment_id: number;

      @Field(() => String, { nullable: true })
      status?: string;

      @Field(() => String, { nullable: true })
      courier_name?: string;

      @Field(() => String, { nullable: true })
      tracking_number?: string;

      @Field(() => String, { nullable: true })
      shipment_date?: string;

      @Field(() => String, { nullable: true })
      delivery_date?: string;
    }

    @InputType()
    export class ShipmentFilters {
        @Field(() => ID, { nullable: true })
        order_id?: number;

        @Field({ nullable: true })
        status?: string;

        @Field({ nullable: true })
        courier_name?: string;
    }
    
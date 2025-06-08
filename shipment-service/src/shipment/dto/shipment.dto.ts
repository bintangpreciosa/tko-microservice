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
      // @Directive('@external')
      payment_status?: string;

      @Field(() => String, { nullable: true })
      // @Directive('@external')
      shipping_status?: string;
    }

    @ObjectType()
    @Directive('@key(fields: "shipment_id")') // <-- TAMBAHKAN DIRECTIVE INI
    export class ShipmentDTO {
      @Field(() => ID)
      shipment_id: number;

      @Field(() => ID)
      order_id: number; // Tetap ada order_id untuk referensi internal

      @Field(() => OrderRefDTO, { nullable: true }) // Gunakan OrderRefDTO di sini untuk relasi ke Order Subgraph
      order?: OrderRefDTO; // Nama field di DTO akan jadi 'order'

      @Field(() => String, { nullable: true })
      shipment_date?: string | null; // ISO string

      @Field(() => String, { nullable: true })
      delivery_date?: string | null; // ISO string

      @Field(() => String)
      status: string;

      @Field(() => String, { nullable: true })
      courier_name?: string | null;

      @Field(() => String, { nullable: true })
      tracking_number?: string | null;

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

      @Field(() => String)
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
    
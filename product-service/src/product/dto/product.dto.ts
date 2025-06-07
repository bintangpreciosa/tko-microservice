    // src/product/dto/product.dto.ts
    import { Field, ID, ObjectType, InputType, Float, Int, Directive } from '@nestjs/graphql';

    @ObjectType()
    @Directive('@key(fields: "product_id")')
    export class ProductDTO {
      @Field(() => ID)
      product_id: number;
      
      @Field()
      name: string;

      @Field({ nullable: true })
      description?: string;

      @Field(() => Float)
      price: number;

      @Field(() => Int)
      stock: number;

      @Field({ nullable: true })
      image_url?: string;

      @Field()
      status: string;

      @Field(() => String)
      created_at: string;

      @Field(() => String, { nullable: true })
      updated_at?: string;
    }

    @InputType()
    export class CreateProductInput {
      @Field() // <-- PASTIKAN INI ADA
      name: string;

      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      description?: string;

      @Field(() => Float) // <-- PASTIKAN INI ADA
      price: number;

      @Field(() => Int) // <-- PASTIKAN INI ADA
      stock: number;

      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      image_url?: string;

      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      status?: string;
    }

    @InputType()
    export class UpdateProductInput {
      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      name?: string;

      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      description?: string;

      @Field(() => Float, { nullable: true }) // <-- PASTIKAN INI ADA
      price?: number;

      @Field(() => Int, { nullable: true }) // <-- PASTIKAN INI ADA
      stock?: number;

      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      image_url?: string;

      @Field({ nullable: true }) // <-- PASTIKAN INI ADA
      status?: string;
    }

    @InputType()
    export class ProductFilters {
      @Field(() => String, { nullable: true })
      search?: string;

      @Field(() => Float, { nullable: true })
      minPrice?: number;

      @Field(() => Float, { nullable: true })
      maxPrice?: number;

      @Field(() => Int, { nullable: true })
      minStock?: number;

      @Field(() => Int, { nullable: true })
      maxStock?: number;

      @Field(() => String, { nullable: true })
      status?: string;
    }
    
    // src/product/dto/product.dto.ts
    import { Field, ID, ObjectType, InputType, Float, Int, Directive } from '@nestjs/graphql';

     @ObjectType()
    @Directive('@key(fields: "product_id")')
    export class ProductDTO {
      @Field(() => ID)
      product_id: number;
      
      @Field()
      // @Directive('@shareable') 
      name: string;

      @Field({ nullable: true })
      // @Directive('@shareable') 
      description?: string;

      @Field(() => Float)
      // @Directive('@shareable') 
      price: number;

      @Field(() => Int)
      // @Directive('@shareable') 
      stock: number;

      @Field({ nullable: true })
      // @Directive('@shareable') 
      image_url?: string;

      @Field()
      // @Directive('@shareable') 
      status: string;

      @Field(() => String)
      // @Directive('@shareable') 
      created_at: string;

      @Field(() => String, { nullable: true })
      // @Directive('@shareable') 
      updated_at?: string;

    }

    @InputType()
    export class CreateProductInput {
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

      @Field({ nullable: true }) 
      status?: string;
    }

    @InputType()
    export class UpdateProductInput {
      @Field({ nullable: true }) 
      name?: string;

      @Field({ nullable: true }) 
      description?: string;

      @Field(() => Float, { nullable: true }) 
      price?: number;

      @Field(() => Int, { nullable: true }) 
      stock?: number;

      @Field({ nullable: true }) 
      image_url?: string;

      @Field({ nullable: true }) 
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
    
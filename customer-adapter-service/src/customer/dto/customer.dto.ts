// src/customer/dto/customer.dto.ts
import { Field, ID, ObjectType, InputType, Int, Directive } from '@nestjs/graphql';

@ObjectType()
export class CustomerLogin {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  customer_id: number;

  @Field(() => String) 
  login_time: string;
}

@ObjectType()
@Directive('@key(fields: "id")') 
export class CustomerDTO {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  postal_code?: string;

  @Field({ nullable: true })
  country?: string;

  @Field(() => String) 
  created_at: string;

  @Field(() => [CustomerLogin], { nullable: true })
  logins?: CustomerLogin[];
}

@InputType()
export class CreateCustomerInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  postal_code?: string;

  @Field({ nullable: true })
  country?: string;
}

@InputType()
export class UpdateCustomerInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  postal_code?: string;

  @Field({ nullable: true })
  country?: string;
}

@InputType()
export class CustomerFilters {
  @Field(() => String, { nullable: true })
  search?: string;
  
  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

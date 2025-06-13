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
  postalCode?: string;

  @Field({ nullable: true })
  country?: string;

  @Field(() => Date) 
  createdAt: Date;

  @Field(() => [CustomerLogin], { nullable: true })
  logins?: CustomerLogin[];
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  country?: string;
  limit?: number;
  offset?: number;
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

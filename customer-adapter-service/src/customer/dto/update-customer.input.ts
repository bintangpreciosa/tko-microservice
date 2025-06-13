import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCustomerInput } from 'src/customer/dto/create-customer.input';

@InputType()
export class UpdateCustomerInput extends PartialType(CreateCustomerInput) {
  @Field()
  id: string;
}

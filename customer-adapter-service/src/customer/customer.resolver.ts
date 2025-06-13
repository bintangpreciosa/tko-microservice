import { Resolver, Query, Mutation, Args, ID, ObjectType, Field, Int, ResolveReference } from '@nestjs/graphql';
import { Logger, NotFoundException } from '@nestjs/common';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerDTO, CustomerFilters } from 'src/customer/dto/customer.dto';
import { CreateCustomerInput } from 'src/customer/dto/create-customer.input';
import { UpdateCustomerInput } from 'src/customer/dto/update-customer.input';

@ObjectType()
export class CustomerConnection {
  @Field(() => [CustomerDTO])
  edges: CustomerDTO[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@Resolver(() => CustomerDTO)
export class CustomerResolver {
  private readonly logger = new Logger(CustomerResolver.name);

  constructor(
    private readonly customerService: CustomerService,
  ) {}

  @Query(() => CustomerDTO, { 
    nullable: true, 
    description: 'Mengambil detail customer berdasarkan ID dari CRM Service.' 
  })
  async customer(@Args('id', { type: () => ID }) id: string): Promise<CustomerDTO | null> {
    this.logger.log(`Fetching customer with ID: ${id}`);
    try {
      const customer = await this.customerService.getCustomerById(id);
      if (!customer) {
        this.logger.warn(`Customer with ID ${id} not found`);
        return null;
      }
      return customer;
    } catch (error) {
      this.logger.error(`Error fetching customer with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  @Query(() => [CustomerDTO], {
    description: 'Mengambil daftar customer dengan filter opsional.'
  })
  async customers(
    @Args('filters', { nullable: true }) filters?: CustomerFilters,
  ): Promise<CustomerDTO[]> {
    this.logger.log('Fetching all customers');
    try {
      return await this.customerService.getCustomers(filters);
    } catch (error) {
      this.logger.error(`Error fetching customers: ${error.message}`);
      throw error;
    }
  }

  @Mutation(() => CustomerDTO, { 
    description: 'Membuat customer baru di CRM Service.' 
  })
  async createCustomer(
    @Args('input') input: CreateCustomerInput,
  ): Promise<CustomerDTO> {
    this.logger.log('Creating a new customer');
    try {
      return await this.customerService.createCustomer(input);
    } catch (error) {
      this.logger.error(`Error creating customer: ${error.message}`);
      throw error;
    }
  }

  @Mutation(() => CustomerDTO, {
    description: 'Memperbarui data customer yang sudah ada.'
  })
  async updateCustomer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCustomerInput,
  ): Promise<CustomerDTO> {
    this.logger.log(`Updating customer with ID: ${id}`);
    try {
      return await this.customerService.updateCustomer(id, input);
    } catch (error) {
      this.logger.error(`Error updating customer: ${error.message}`);
      throw error;
    }
  }

  @Mutation(() => Boolean, { 
    description: 'Menghapus customer dari CRM Service.' 
  })
  async deleteCustomer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting customer with ID: ${id}`);
    try {
      return await this.customerService.deleteCustomer(id);
    } catch (error) {
      this.logger.error(`Error deleting customer: ${error.message}`);
      throw error;
    }
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: string }): Promise<CustomerDTO> {
    this.logger.log(`Resolving customer reference: ${reference.id}`);
    try {
      const customer = await this.customerService.getCustomerById(reference.id);
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${reference.id} not found.`);
      }
      return customer;
    } catch (error) {
      this.logger.error(`Error resolving customer reference: ${error.message}`);
      throw error;
    }
  }
}
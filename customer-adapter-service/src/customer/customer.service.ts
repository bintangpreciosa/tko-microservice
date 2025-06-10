// src/customer/customer.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'; // Tambahkan NotFoundException
import axios from 'axios';
import { CustomerDTO, CreateCustomerInput, UpdateCustomerInput, CustomerFilters } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  private readonly CRM_GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql';

  // Header untuk autentikasi (jika diperlukan)
  private readonly AUTH_HEADERS = {
    // 'Authorization': 'Bearer YOUR_CRM_API_KEY_OR_TOKEN', // Uncomment & ganti jika CRM butuh auth
    'Content-Type': 'application/json',
  };

  // Helper untuk memetakan Customer dari respon CRM ke CustomerDTO
  private mapCrmCustomerToDTO(crmCustomer: any): CustomerDTO | null {
    if (!crmCustomer) return null;

    const customerDTO = new CustomerDTO();
    customerDTO.id = String(crmCustomer.id);
    customerDTO.name = crmCustomer.name;
    customerDTO.email = crmCustomer.email;
    customerDTO.phone = crmCustomer.phone ?? null;
    customerDTO.address = crmCustomer.address ?? null;
    customerDTO.city = crmCustomer.city ?? null;
    customerDTO.postal_code = crmCustomer.postal_code ?? null;
    customerDTO.country = crmCustomer.country ?? null;
    customerDTO.created_at = crmCustomer.created_at || '';

    return customerDTO;
  }

  async getCustomerById(id: string): Promise<CustomerDTO | null> {
    const query = `
      query GetCustomer($id: ID!) {
        customer(id: $id) {
          id
          name
          email
          phone
          address
          city
          postal_code
          country
          created_at
          # updated_at DIHAPUS SESUAI PERMINTAAN CRM
        }
      }
    `;
    try {
      const response = await axios.post(
        this.CRM_GRAPHQL_ENDPOINT,
        { query, variables: { id } },
        { headers: this.AUTH_HEADERS },
      );

      if (response.data.errors) {
        console.error('CRM GraphQL Errors in getCustomerById:', response.data.errors);
        throw new InternalServerErrorException('CRM API returned errors for customer query.');
      }
      if (!response.data.data || !response.data.data.customer) {
          return null;
      }
      return this.mapCrmCustomerToDTO(response.data.data.customer)!;
    } catch (error) {
      console.error('Error fetching customer by ID from CRM:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to fetch customer data from CRM.');
    }
  }

  async createCustomer(input: CreateCustomerInput): Promise<CustomerDTO> {
    const mutation = `
      mutation CreateCustomer($input: CreateCustomerInput!) {
        createCustomer(input: $input) {
          id
          name
          email
          phone
          address
          city
          postal_code
          country
          created_at
          # updated_at DIHAPUS SESUAI PERMINTAAN CRM
        }
      }
    `;
    try {
      const response = await axios.post(
        this.CRM_GRAPHQL_ENDPOINT,
        { query: mutation, variables: { input } },
        { headers: this.AUTH_HEADERS },
      );

      if (response.data.errors) {
        console.error('CRM GraphQL Errors in createCustomer:', response.data.errors);
        throw new InternalServerErrorException('CRM API returned errors for customer creation.');
      }
      if (!response.data.data || !response.data.data.createCustomer) {
          throw new InternalServerErrorException('CRM API did not return created customer data.');
      }
      return this.mapCrmCustomerToDTO(response.data.data.createCustomer)!;
    } catch (error) {
      console.error('Error creating customer in CRM:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to create customer in CRM.');
    }
  }

  async findAllCustomers(filters?: CustomerFilters): Promise<any> {
    const query = `
      query GetCustomers($filters: CustomerFilters) {
        customers(filters: $filters) {
          customers {
            id
            name
            email
            phone
            address
            city
            postal_code
            country
            created_at
            # updated_at DIHAPUS
          }
          totalCount
          hasNextPage
          hasPreviousPage
        }
      }
    `;
    try {
      const response = await axios.post(
        this.CRM_GRAPHQL_ENDPOINT,
        { query, variables: { filters } },
        { headers: this.AUTH_HEADERS },
      );

      if (response.data.errors) {
        console.error('CRM GraphQL Errors in findAllCustomers:', response.data.errors);
        throw new InternalServerErrorException('CRM API returned errors for all customers query.');
      }
      if (!response.data.data || !response.data.data.customers) {
          return { customers: [], totalCount: 0, hasNextPage: false, hasPreviousPage: false };
      }
      const mappedCustomers = response.data.data.customers.customers.map(c => this.mapCrmCustomerToDTO(c)).filter((c): c is CustomerDTO => c !== null);

      return {
          customers: mappedCustomers,
          totalCount: response.data.data.customers.totalCount,
          hasNextPage: response.data.data.customers.hasNextPage,
          hasPreviousPage: response.data.data.customers.hasPreviousPage,
      };
    } catch (error) {
      console.error('Error fetching all customers from CRM:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to fetch all customer data from CRM.');
    }
  }

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerDTO> {
    const mutation = `
      mutation UpdateCustomer($id: ID!, $input: UpdateCustomerInput!) {
        updateCustomer(id: $id, input: $input) {
          id
          name
          email
          phone
          address
          city
          postal_code
          country
          created_at
        }
      }
    `;
    try {
      const response = await axios.post(
        this.CRM_GRAPHQL_ENDPOINT,
        { query: mutation, variables: { id, input } },
        { headers: this.AUTH_HEADERS },
      );

      if (response.data.errors) {
        console.error('CRM GraphQL Errors in updateCustomer:', response.data.errors);
        const crmError = response.data.errors[0];
        if (crmError && crmError.message.includes('not found')) {
            throw new NotFoundException(`Customer with ID ${id} not found in CRM.`);
        }
        throw new InternalServerErrorException('CRM API returned errors for customer update. (Possibly missing updated_at column in CRM DB)');
      }
      if (!response.data.data || !response.data.data.updateCustomer) {
          throw new InternalServerErrorException('CRM API did not return updated customer data.');
      }
      return this.mapCrmCustomerToDTO(response.data.data.updateCustomer)!;
    } catch (error) {
      console.error('Error updating customer in CRM:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to update customer in CRM.');
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteCustomer($id: ID!) {
        deleteCustomer(id: $id)
      }
    `;
    try {
      const response = await axios.post(
        this.CRM_GRAPHQL_ENDPOINT,
        { query: mutation, variables: { id } },
        { headers: this.AUTH_HEADERS },
      );

      if (response.data.errors) {
        console.error('CRM GraphQL Errors in deleteCustomer:', response.data.errors);
        throw new InternalServerErrorException('CRM API returned errors for customer deletion.');
      }
      return response.data.data.deleteCustomer; 
    } catch (error) {
      console.error('Error deleting customer in CRM:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to delete customer in CRM.');
    }
  }
}

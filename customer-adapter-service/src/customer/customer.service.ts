import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CustomerDTO, CustomerFilters } from 'src/customer/dto/customer.dto';
import { CreateCustomerInput } from 'src/customer/dto/create-customer.input';
import { UpdateCustomerInput } from 'src/customer/dto/update-customer.input';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);
  private readonly crmApiUrl: string;
  private readonly authHeaders: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.crmApiUrl = this.configService.get<string>('CRM_API_URL') || 'http://localhost:3000';
    this.authHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': this.configService.get<string>('CRM_API_KEY') || '',
    };

    if (!this.crmApiUrl) {
      throw new Error('CRM_API_URL is not defined in environment variables');
    }

    this.logger.log(`CRM API URL: ${this.crmApiUrl}`);
  }

  // Helper untuk memetakan Customer dari respon CRM ke CustomerDTO
  private mapCrmCustomerToDTO(customer: any): CustomerDTO | null {
    if (!customer) return null;

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postal_code || customer.postalCode,
      country: customer.country,
      createdAt: customer.created_at ? new Date(customer.created_at) : new Date(),
    };
  }

  async getCustomerById(id: string): Promise<CustomerDTO> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.crmApiUrl}/customers/${id}`, {
          headers: this.authHeaders,
        }),
      );
      const customer = this.mapCrmCustomerToDTO(response.data);
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching customer ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch customer');
    }
  }

  async createCustomer(input: CreateCustomerInput): Promise<CustomerDTO> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.crmApiUrl}/customers`,
          input,
          { headers: this.authHeaders },
        ),
      );
      const customer = this.mapCrmCustomerToDTO(response.data);
      if (!customer) {
        throw new InternalServerErrorException('Failed to create customer: Invalid response from server');
      }
      return customer;
    } catch (error) {
      this.logger.error(`Error creating customer: ${error.message}`);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerDTO> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.crmApiUrl}/customers/${id}`,
          { ...input, id },
          { headers: this.authHeaders },
        ),
      );
      const customer = this.mapCrmCustomerToDTO(response.data);
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating customer ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update customer');
    }
  }

  async getCustomers(filters?: CustomerFilters): Promise<CustomerDTO[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.crmApiUrl}/customers`, {
          headers: this.authHeaders,
          params: filters,
        }),
      );
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new InternalServerErrorException('Invalid response format from CRM service');
      }
      
      return response.data
        .map(customer => this.mapCrmCustomerToDTO(customer))
        .filter((customer): customer is CustomerDTO => customer !== null);
    } catch (error) {
      this.logger.error(`Error fetching customers: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch customers');
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.crmApiUrl}/customers/${id}`, {
          headers: this.authHeaders,
        }),
      );
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      this.logger.error(`Error deleting customer ${id}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete customer');
    }
  }
}

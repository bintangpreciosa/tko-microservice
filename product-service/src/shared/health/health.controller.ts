import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const checks = [
      () => this.db.pingCheck('database'),
    ];

    // Add HTTP health checks for dependent services if they exist in config
    const productServiceUrl = this.configService.get('PRODUCT_SERVICE_URL');
    if (productServiceUrl) {
      checks.push(() => 
        this.http.pingCheck('product-service', productServiceUrl.replace('/graphql', '/health'))
      );
    }

    const customerServiceUrl = this.configService.get('CUSTOMER_SERVICE_URL');
    if (customerServiceUrl) {
      checks.push(() =>
        this.http.pingCheck('customer-service', customerServiceUrl.replace('/graphql', '/health'))
      );
    }

    const orderServiceUrl = this.configService.get('ORDER_SERVICE_URL');
    if (orderServiceUrl) {
      checks.push(() =>
        this.http.pingCheck('order-service', orderServiceUrl.replace('/graphql', '/health'))
      );
    }

    return this.health.check(checks);
  }
}

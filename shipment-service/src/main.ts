// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Listen on all network interfaces
  await app.listen(4004, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 4006;
  await app.listen(port);
  
  logger.log(`=================================`);
  logger.log(`🚀 Customer Adapter Service`);
  logger.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🚀 GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`🚀 Health Check: http://localhost:${port}/api/health`);
  logger.log(`=================================`);
}

bootstrap().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
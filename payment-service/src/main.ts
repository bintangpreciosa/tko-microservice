    // src/main.ts
    import 'reflect-metadata';
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      await app.listen(4003);
    }
    bootstrap();
    
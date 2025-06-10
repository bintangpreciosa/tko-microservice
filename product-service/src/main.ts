    // src/main.ts
    import 'reflect-metadata';
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      await app.listen(4001); // <-- Product Service akan berjalan di port 4001
    }
    bootstrap();
    
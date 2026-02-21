import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development, specific origins in production
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.use(morgan('dev'));

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server running on port ${process.env.PORT ?? 3000}`);
  });
}

bootstrap();

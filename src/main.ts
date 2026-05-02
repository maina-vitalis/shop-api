import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser requests (e.g., server-to-server) where origin is undefined
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

      let hostMatches = false;
      try {
        const url = new URL(origin);
        hostMatches =
          url.hostname === 'vitalismaina.me' ||
          url.hostname.endsWith('.vitalismaina.me');
      } catch (err) {
        console.log(err);
        hostMatches =
          origin.endsWith('.vitalismaina.me') ||
          origin.includes('vitalismaina.me');
      }

      const isAllowedExplicitly =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(new URL(origin).hostname as unknown as string);

      if (isAllowedExplicitly || hostMatches) {
        callback(null, true);
      } else {
        Logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    optionsSuccessStatus: 204,
  });

  app.use(morgan('dev'));
  app.use(cookieParser());

  //swagger set-up
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server running on port ${process.env.PORT ?? 3000}`);
  });
}

bootstrap();

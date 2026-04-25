import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';

import { RedisModule } from './shared/redis';
import { MailModule } from './shared/mail';

// Application configurations
import { validateEnv } from './config/env.config';
import { CloudinaryModule } from './shared/cloudinary/cloudinary.module';
import { ProductModule } from './modules/products/product.module';
import { VendorStoreModule } from './modules/vendor-store/vendor-store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    RedisModule,
    MailModule,
    AuthModule,
    UsersModule,
    CloudinaryModule,
    ProductModule,
    VendorStoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

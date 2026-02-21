import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { RedisModule } from './shared/redis/redis.module';
import { MailModule } from './shared/mail/mail.module';

// Application configurations
import { validateEnv } from './config/env.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

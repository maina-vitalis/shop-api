import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../../shared/mail';
import { RedisModule } from '../../shared/redis';

// Controllers
import { AuthController } from './controllers/auth.controller';

// Services
import { AuthService } from './services';
import { OtpService } from './services';
import { TokenService } from './services';

// Strategies
import { JwtStrategy } from './strategies';
import { JwtRefreshStrategy } from './strategies';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    RedisModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    TokenService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}

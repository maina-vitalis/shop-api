import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

// Controllers
import { AuthController } from './controllers/auth.controller';

// Services
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PrismaModule,
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

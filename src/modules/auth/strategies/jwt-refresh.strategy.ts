import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  userId: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.refresh_token || null;
      },
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('REFRESH_TOKEN_SECRET') || 'secret',
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req?.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, refreshToken };
  }
}

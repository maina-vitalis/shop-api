import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface TokenPayload {
  userId: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown verification error';

      this.logger.warn(`Access token verification failed: ${message}`);
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown verification error';

      this.logger.warn(`Refresh token verification failed: ${message}`);
      return null;
    }
  }
}

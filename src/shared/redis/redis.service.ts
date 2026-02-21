import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    this.client = new Redis(redisUrl);

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set a value in Redis with optional expiration (in seconds)
   */
  async set(
    key: string,
    value: string,
    expiryMode?: 'EX',
    time?: number,
  ): Promise<'OK'> {
    if (expiryMode && time) {
      return this.client.set(key, value, expiryMode, time);
    }
    return this.client.set(key, value);
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Increment a value in Redis
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  /**
   * Get the raw Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}

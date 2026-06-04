import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { tenantExtension } from './tenant.extension';
import { AsyncStorageService } from '../../shared/asyncLocalStorage/asynStorage.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public readonly tenantClient;

  constructor(private readonly storeStorage: AsyncStorageService) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    const adapter = new PrismaPg({ connectionString: databaseUrl });
    super({ adapter });

    this.tenantClient = this.$extends(tenantExtension(storeStorage));
  }

  async onModuleInit() {
    await this.$connect();
  }
}

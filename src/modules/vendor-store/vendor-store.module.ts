import { Module } from '@nestjs/common';
import { VendorStoreService } from './vendor-store.service';
import { VendorStoreController } from './vendor-store.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StoreGuardContext } from '../../shared/tenantGuard/tenantGuard';

@Module({
  controllers: [VendorStoreController],
  providers: [VendorStoreService, StoreGuardContext],
  imports: [PrismaModule],
})
export class VendorStoreModule {}

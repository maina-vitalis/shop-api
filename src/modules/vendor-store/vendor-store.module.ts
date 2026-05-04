import { Module } from '@nestjs/common';
import { VendorStoreService } from './vendor-store.service';
import { VendorStoreController } from './vendor-store.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [VendorStoreController],
  providers: [VendorStoreService],
  imports: [PrismaModule],
})
export class VendorStoreModule {}

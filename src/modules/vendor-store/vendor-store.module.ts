import { Module } from '@nestjs/common';
import { VendorStoreService } from './vendor-store.service';
import { VendorStoreController } from './vendor-store.controller';

@Module({
  controllers: [VendorStoreController],
  providers: [VendorStoreService],
})
export class VendorStoreModule {}

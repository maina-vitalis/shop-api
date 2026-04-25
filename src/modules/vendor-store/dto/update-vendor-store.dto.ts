import { PartialType } from '@nestjs/swagger';
import { CreateVendorStoreDto } from './create-vendor-store.dto';

export class UpdateVendorStoreDto extends PartialType(CreateVendorStoreDto) {}

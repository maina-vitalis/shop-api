import { PartialType } from '@nestjs/swagger';
import { CreateVendorStoreDto } from './create-vendor-store.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateVendorStoreDto extends PartialType(CreateVendorStoreDto) {
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

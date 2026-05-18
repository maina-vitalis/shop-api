import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { BusinessType, StoreStatus } from '../../../generated/prisma/enums';

export class CreateVendorStoreDto {
  @IsNotEmpty()
  @IsString()
  storeName!: string;

  @IsOptional()
  @IsString()
  registeredName?: string;

  @IsOptional()
  @IsString()
  description!: string;

  @IsOptional()
  @IsEnum(BusinessType)
  businessType!: BusinessType;

  @IsOptional()
  @IsUrl()
  idDocumentUrl?: string;

  @IsOptional()
  @IsString()
  taxDocument?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;
}

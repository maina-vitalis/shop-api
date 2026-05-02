import { IsEnum, IsString } from 'class-validator';
import { BusinessType } from '../../../generated/prisma/enums';

export class PartialBusinessDto {
  @IsString()
  storeName?: string;

  @IsString()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @IsString()
  description?: string;
}

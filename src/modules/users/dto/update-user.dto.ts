import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;
}

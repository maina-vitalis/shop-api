import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword!: string;
}

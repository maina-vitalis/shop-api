import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(5, 5, { message: 'OTP must be 5 digits' })
  OTP!: string;
}

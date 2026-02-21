import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword!: string;

  @ApiProperty({ example: 'Kenya' })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString()
  country!: string;
}

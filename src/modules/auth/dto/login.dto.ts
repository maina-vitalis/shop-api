import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}

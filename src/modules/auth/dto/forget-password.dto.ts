import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}

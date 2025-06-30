import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'john.doe@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'strongPass@123' })
  @IsString()
  password: string;
}

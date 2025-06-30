import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordAuthDto {
  @ApiProperty({ example: 'strongPass@123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'strongPass@123' })
  @IsString()
  password: string;
}

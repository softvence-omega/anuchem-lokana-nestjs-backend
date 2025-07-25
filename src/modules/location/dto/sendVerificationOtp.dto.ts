import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendVerificationOtpDto {
  @ApiProperty({ example: '+233241234567', type: 'string' })
  @IsString()
  phone: string;
}
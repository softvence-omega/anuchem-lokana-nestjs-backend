import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendVerificationOtpDto {
  @ApiProperty({ example: '123193847', type: 'string' })
  @IsString()
  phone: string;
}

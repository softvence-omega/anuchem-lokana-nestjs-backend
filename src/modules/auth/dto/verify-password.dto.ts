import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyOtpAuthDto {
  @ApiProperty({ example: 'token' })
  @IsString()
  @IsOptional()
  resetToken: string;

  @ApiProperty({ example: 'token' })
  @IsString()
  @IsOptional()
  verificationToken: string;

  @ApiProperty({ example: 'otp' })
  @IsString()
  otp: string;
}

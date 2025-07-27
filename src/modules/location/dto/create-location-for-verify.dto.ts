import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLocationForVerifyDto {
  @ApiProperty({ example: '51.5074°N, 0.123°W', type: 'string' })
  @IsString()
  gps_code: string;

  @ApiProperty({ example: 'park avenue', type: 'string' })
  @IsString()
  @IsOptional()
  street_name: string;

  @ApiProperty({ example: 'Manhattan', type: 'string' })
  @IsString()
  @IsOptional()
  district: string;

  @ApiProperty({ example: 'Western New York', type: 'string' })
  @IsString()
  @IsOptional()
  region: string;

  @ApiProperty({ example: 'location descriptions', type: 'string' })
  @IsString()
  @IsOptional()
  description: string;
}

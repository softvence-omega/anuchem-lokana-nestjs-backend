import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateLocationSimSelfieDto {
  @ApiProperty({ example: '51.5074°N, 0.123°W', type: 'string' })
  @IsString()
  gps_code: string;

  @ApiProperty({ example: 'park avenue', type: 'string' })
  @IsString()
  street_name: string;

  @ApiProperty({ example: 'Manhattan', type: 'string' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Western New York', type: 'string' })
  @IsString()
  region: string;

  @ApiProperty({ example: '+233241234567', type: 'string' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Selfie image file',
    type: 'string',
    format: 'binary',
  })
  selfie: any;

  @ApiProperty({
    description: 'Multiple location photos',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  photos: any[];

  @ApiProperty({ example: 'alskdjfowisalkdfjo...', type: 'string' })
  @IsString()
  verified_token: string;
}

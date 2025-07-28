import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLocationSimSelfieDto {
  @ApiProperty({ example: '26db79f4-60f5-4ab9-8ea4-c1d022df82f6', type: 'string' })
  @IsString()
  location_id: string;

  @ApiProperty({ example: '+233241234567', type: 'string' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Selfie image file',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  selfie: any;

  // @ApiProperty({
  //   description: 'Multiple location photos',
  //   type: 'array',
  //   items: {
  //     type: 'string',
  //     format: 'binary',
  //   },
  //   required: false
  // })
  // @IsOptional()
  // photos: any[];

  @ApiProperty({ example: 'alskdjfowisalkdfjo...', type: 'string' })
  @IsString()
  verified_token: string;
}

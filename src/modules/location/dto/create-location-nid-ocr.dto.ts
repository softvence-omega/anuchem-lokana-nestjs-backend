import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateLocationSimSelfieDto } from './create-location-sim-selfie.dto';
import { IsString } from 'class-validator';

export class CreateLocationNidOcrDto extends PartialType(
  OmitType(CreateLocationSimSelfieDto, ['phone', 'verified_token'] as const),
) {
  @ApiProperty({ example: 'Nid card photo', format: 'binary', type: 'string' })
  doc: string;
}

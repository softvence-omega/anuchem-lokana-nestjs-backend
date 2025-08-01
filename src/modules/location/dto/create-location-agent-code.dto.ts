import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateLocationSimSelfieDto } from './create-location-sim-selfie.dto';
import { IsString } from 'class-validator';

export class CreateLocationAgentCodeDto extends PartialType(
  OmitType(CreateLocationSimSelfieDto, [
    'phone',
    'selfie',
    'verified_token',
  ]),
) {
  @ApiProperty()
  @IsString()
  agent_code: string;
}

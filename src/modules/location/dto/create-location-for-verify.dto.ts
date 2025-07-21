import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLocationSimSelfieDto } from './create-location-sim-selfie.dto';

export class CreateLocationForVerifyDto extends PartialType(
  OmitType(CreateLocationSimSelfieDto, ['phone', 'selfie', 'verified_token']),
) {}

import { IntersectionType, PartialType } from '@nestjs/swagger';
import { CreateLocationSimSelfieDto } from './create-location-sim-selfie.dto';
import { CreateLocationApiVerificationDto } from './create-location-api-verfication.dto';

export class UpdateLocationDto extends PartialType(
  IntersectionType(
    CreateLocationSimSelfieDto,
    CreateLocationApiVerificationDto,
  ),
) {}

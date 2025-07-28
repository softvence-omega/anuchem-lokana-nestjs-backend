import { IntersectionType, PartialType } from '@nestjs/swagger';
import { CreateLocationApiVerificationDto } from './create-location-api-verfication.dto';
import { CreateLocationForVerifyDto } from './create-location-for-verify.dto';

export class UpdateLocationDto extends PartialType(
  IntersectionType(
    CreateLocationForVerifyDto,
    CreateLocationApiVerificationDto,
  ),
) { }

import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificaitonCode } from '../user/entities/verification-code.entity';
import { Location } from './entities/location.entity';
import { LocationImage } from './entities/location-selfie.entity';
import { LocationApiVerificationInfo } from './entities/location-api-verification-info.entity';
import { LocationDocs } from './entities/location-docs.entity';
import { JwtHelperModule } from 'src/config/jwt.module';
import { LocationReaction } from './entities/location-reaction';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VerificaitonCode,
      Location,
      LocationImage,
      LocationApiVerificationInfo,
      LocationDocs,
      LocationReaction
    ]),
    CommonModule,
    JwtHelperModule,
  ],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule { }

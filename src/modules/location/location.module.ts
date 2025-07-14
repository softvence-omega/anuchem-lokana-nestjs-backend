import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificaitonCode } from '../user/entities/verification-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerificaitonCode]),CommonModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}

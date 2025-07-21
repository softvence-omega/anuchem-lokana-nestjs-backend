// dto/location-reaction.dto.ts
import { IsEnum } from 'class-validator';
import { ReactionType } from '../entities/location-reaction';
import { ApiProperty } from '@nestjs/swagger';

export class LocationReactionDto {
    @ApiProperty({ enum: ReactionType })
    @IsEnum(ReactionType)
    reactionType: ReactionType;
}

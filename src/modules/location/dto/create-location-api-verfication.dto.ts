import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateLocationNidOcrDto } from './create-location-nid-ocr.dto';
import { IsString } from 'class-validator';

export class CreateLocationApiVerificationDto extends PartialType(
    OmitType(CreateLocationNidOcrDto, ['photos']),
) {
    @ApiProperty({ example: "John Doe", type: "string" })
    @IsString()
    full_name: string;

    @ApiProperty({ example: "2025-01-01", type: "string" })
    @IsString()
    date_of_birth: string;

    @ApiProperty({ example: "38137984108", type: "string" })
    @IsString()
    nid_number: string;

    @ApiProperty({ example: "germany", type: "string" })
    @IsString()
    country: string;
}

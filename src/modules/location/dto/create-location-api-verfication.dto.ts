import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { CreateLocationNidOcrDto } from "./create-location-nid-ocr.dto";
import { IsString } from "class-validator";

export class CreateLocationApiVerificationDto extends PartialType(OmitType(CreateLocationNidOcrDto, ['photos'])){
    @ApiProperty()
    @IsString()
    full_name: string;

    @ApiProperty()
    @IsString()
    date_of_birth: string;

    @ApiProperty()
    @IsString()
    nid_number: string;

    @ApiProperty()
    @IsString()
    country: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Status } from "../entities/location.entity";


export class CreateLocationDto {
    @ApiProperty({ example: "51.5074°N, 0.123°W", type: 'string' })
    @IsString()
    gps_code: string;

    @ApiProperty({ example: "park avenue", type: 'string' })
    @IsString()
    street_name: string;

    @ApiProperty({ example: "Manhattan", type: 'string' })
    @IsString()
    district: string;

    @ApiProperty({ example: "Western New york", type: 'string' })
    @IsString()
    region: string;

    @ApiProperty({ example: Status.PENDING, enum: Status })
    @IsEnum(Status)
    status: Status;

    @ApiProperty({ example: "+880", type: 'string', required: false })
    @IsString()
    @IsOptional()
    country_code?: string;

    @ApiProperty({ example: '123-1938430', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'Nid card', required: false })
    @IsString()
    @IsOptional()
    doc_type: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    selfie: any;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    doc: any;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    utility_doc: any;
}

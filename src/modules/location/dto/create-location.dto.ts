import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


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

    @ApiProperty({ example: "+880", type: 'string' })
    @IsString()
    @IsOptional()
    country_code?: string;

    @ApiProperty({ example: '123-1938430' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'Nid card' })
    @IsString()
    @IsOptional()
    doc_type: string;
}

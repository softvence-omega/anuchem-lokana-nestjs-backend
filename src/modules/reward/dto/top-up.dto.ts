import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class TopUpDto {
    @ApiProperty({ example: "+233241234567", type: "string" })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ example: 60.00, type: "number" })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 617, type: "number" })
    @IsNumber()
    operatorId: number;

    @ApiProperty({ example: "NG", type: "string" })
    @IsString()
    countryIsoName: string;

    @ApiProperty({ example: 1000, type: "number" })
    @IsNumber()
    reward_points: number;
}
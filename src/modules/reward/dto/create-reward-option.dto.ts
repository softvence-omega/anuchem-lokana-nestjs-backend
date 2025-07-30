import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateRewardOptionDto {
    @ApiProperty({ example: "Redeem 30taka", type: "string" })
    @IsString()
    name: string;

    @ApiProperty({ example: 300, type: "number" })
    @IsNumber()
    points: number;

    @ApiProperty({ example: 30, type: "number" })
    @IsNumber()
    reward_amount: number;
}
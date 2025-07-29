import { IsNumber, IsString } from "class-validator";

export class TopUpDto {
    @IsString()
    phoneNumber: string;

    @IsNumber()
    amount: number;

    @IsNumber()
    operatorId: number;

    @IsString()
    countryIsoName: string;

    @IsNumber()
    reward_points: number;
}
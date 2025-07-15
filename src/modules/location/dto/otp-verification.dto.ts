import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class OtpVerificationDto {
    @ApiProperty({example: "akdflkadsf....", type: 'string'})
    @IsString()
    sms_token: string;

    @ApiProperty({example: "123456", type: "string"})
    @IsString()
    otp: string;
}
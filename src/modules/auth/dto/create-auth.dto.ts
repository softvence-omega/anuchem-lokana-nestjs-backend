import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateAuthDto {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    name: string;

    @ApiProperty({ example: "john.doe@gmail.com", type: 'string' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "strong@1234" })
    @IsString()
    password: string;

}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateAuthDto {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    name: string;

    @ApiProperty({ example: "john.doe@gmail.com", type: 'string' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "strong@1234", type: 'string' })
    @IsString()
    password: string;

    @ApiProperty({ example: "123-1398433", type: 'string' })
    @IsString()
    phone: string;

    @ApiProperty({ example: "+880", type: 'string' })
    @IsString()
    country_code: string;

    @ApiProperty({ example: "admin or user", type: 'string' })
    @IsString()
    role: string;
}

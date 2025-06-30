import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Min } from 'class-validator';
import { Role } from 'src/modules/user/entities/user.entity';

export class RegisterAuthDto {
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

  @ApiProperty({ example: Role.USER, enum: Role })
  @IsEnum(Role)
  role: Role;
}

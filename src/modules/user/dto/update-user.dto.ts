import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { RegisterAuthDto } from 'src/modules/auth/dto/register-auth.dto';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterAuthDto, ['email', 'password', 'role'] as const),
) {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image: string;
}

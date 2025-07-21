import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiConsumes, ApiSecurity } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiSecurity('accessToken')
  @Get()
  async findOne(@Req() req) {
    const result = await this.userService.findOne(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Login successfull!',
      data: result,
    };
  }

  @ApiSecurity('accessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Patch()
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userService.update(req.user, updateUserDto, file);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User has been updated successfully!',
      data: result,
    };
  }
}

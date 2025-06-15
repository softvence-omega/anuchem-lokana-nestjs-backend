import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import sendResponse from 'src/common/utils/sendResponse';
import { Public } from 'src/common/utils/public.decorator';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post("login")
  async login(@Body() payload: LoginDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.login(payload);
    sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: "User logged in successfully!",
      data: result
    })
  }


  @Public()
  @Post("register")
  async customerRegister(@Body() payload: CreateAuthDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.register(payload);
    sendResponse(res, {
      statusCode: HttpStatus.ACCEPTED,
      success: true,
      message: "Customer created successfully!",
      data: result
    })
  }

  // @Public()
  // @Post("admin-register")
  // async adminRegister(@Body() payload: CreateAdminDto, @Res() res: Response): Promise<any> {
  //   payload.role = UserRole.ADMIN;
  //   const result = await this.authService.register(payload);
  //   sendResponse(res, {
  //     statusCode: HttpStatus.ACCEPTED,
  //     success: true,
  //     message: "Admin created successfully!",
  //     data: result
  //   })
  // }

  // @Public()
  // @UseInterceptors(FileInterceptor("certificate"))
  // @Post("provider-register")
  // async providerRegister(@Body() payload: CreateProviderDto, @UploadedFile() file: Express.Multer.File, @Res() res: Response): Promise<any> {
  //   payload.role = UserRole.PROVIDER;
  //   const result = await this.authService.register(payload, file);
  //   sendResponse(res, {
  //     statusCode: HttpStatus.ACCEPTED,
  //     success: true,
  //     message: "Provider created successfully!",
  //     data: result
  //   })
  // }

  @Public()
  @Post("forget-password")
  async forgetPassword(@Body() payload: ForgotPasswordDto, @Res() res): Promise<any> {
    const result = await this.authService.forgetPassword(payload);
    sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: "Password reset link sent successfully!",
      data: result
    })
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() payload: ResetPasswordDto, @Res() res): Promise<any> {
    const result = await this.authService.resetPassword(payload);
    sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: "Password reset successfully!",
      data: result
    })
  }

  @Post("change-password")
  async changePassword(@Req() req, @Body() payload: ChangePasswordDto, @Res() res): Promise<any> {
    const result = await this.authService.changePassword(req.user, payload);
    sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: "Password changed successfully!",
      data: result
    })
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/utils/public.decorator';
import { ApiSecurity } from '@nestjs/swagger';
import { ForgetPasswordAuthDto } from './dto/forget-passord.dto';
import { VerifyOtpAuthDto } from './dto/verify-password.dto';
import { ResetPasswordAuthDto } from './dto/reset-password.dto';
import { ChangePasswordAuthDto } from './dto/change-password.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { sendResponse } from 'src/common/utils/sendResponse';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const result = await this.authService.login(loginAuthDto);
    return sendResponse(
      'Login successfull!',
      result,
    );
  }

  @Public()
  @Post('register')
  async register(@Body() payload: RegisterAuthDto) {
    const result = await this.authService.register(payload);
    return sendResponse(
      'Registration successfull!',
      result,
    );
  }

  @Public()
  @Post('forget-password')
  async forgetPassword(@Body() payload: ForgetPasswordAuthDto) {
    const result = await this.authService.forgetPassword(payload);
    return sendResponse(
      'Email sent successfully!',
      result,
    );
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() payload: VerifyOtpAuthDto) {
    const result = await this.authService.verifyOtp(payload);
    return sendResponse(
      'OTP verified successfully!',
      result,
    );
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() payload: ResetPasswordAuthDto) {
    const result = await this.authService.resetPassword(payload);
    return sendResponse(
      'Password was reset successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @Patch('change-password')
  async changePassword(@Req() req, @Body() payload: ChangePasswordAuthDto) {
    const result = await this.authService.changePassword(req.user, payload);
    return sendResponse(
      'Password updated successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @Delete()
  async delete(@Req() req) {
    const result = await this.authService.remove(req.user);
    return sendResponse(
      'Account deleted successfully!',
      result,
    );
  }
}

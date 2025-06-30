import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/nodemailer/email.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetPasswordAuthDto } from './dto/reset-password.dto';
import { ChangePasswordAuthDto } from './dto/change-password.dto';
import { VerifyOtpAuthDto } from './dto/verify-password.dto';
import { ForgetPasswordAuthDto } from './dto/forget-passord.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { User } from '../user/entities/user.entity';
import { BcryptService } from 'src/common/bcrypt/bcrypt.service';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private config: ConfigService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private bcrypt: BcryptService
  ) { }

  async login(payload: LoginAuthDto) {
    const user = await this.userRepository.findOneBy({ email: payload.email });
    if (!user) {
      throw new NotFoundException('User not exist!');
    }

    const matched = await this.bcrypt.comparePasswords(payload.password, user.password);
    if (!matched) {
      throw new ForbiddenException('Email or Password Invalid!');
    }

    const jwtPayload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(payload: RegisterAuthDto) {
    const user = await this.userRepository.findOneBy({ email: payload.email });

    if (user) {
      throw new ForbiddenException('User already exists!');
    }

    const hashPassword = await this.bcrypt.hashPassword(payload.password);
    payload.password = hashPassword;

    const data = await this.userRepository.create(payload);
    const userData = await this.userRepository.save(data);
    const jwtPayload = {
      id: userData.id,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      accessToken,
      user: {
        id: userData.id,
        email: userData.email,
      },
    };
  }

  async forgetPassword(payload: ForgetPasswordAuthDto) {
    const user = await this.userRepository.findOneBy({ email: payload.email });

    if (!user) {
      throw new NotFoundException('User not exists!');
    }

    const generatedOtp = this.emailService.generateNumericCode(6);

    user.otp = generatedOtp;

    await this.userRepository.save(user);

    const text = `
      You requested to reset your password.

      Your OTP (One-Time Password) is: ${generatedOtp}

      Please enter this code in the app to complete your password reset.

      This code is valid for the next 10 minutes. If you did not request this, please ignore this email.
    `;
    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>You requested to reset your password.</p>
        <p><strong>Your OTP (One-Time Password) is:</strong></p>
        <div style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #2c3e50;">${generatedOtp}</div>
        <p>Please enter this code in the app to complete your password reset.</p>
        <p style="color: #999;">This code is valid for the next 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await this.emailService.sendEmail(
      user.email,
      'Password Reset OTP',
      text,
      html,
    );

    //generate jwt token
    const jwtPayload = {
      id: user.id,
    };

    const resetToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: this.config.getOrThrow('RESET_TOKEN_EXPIRES_IN'),
    });

    return {
      resetToken,
    };
  }

  async verifyOtp(payload: VerifyOtpAuthDto) {
    const isVerified = await this.jwtService.verifyAsync(payload.resetToken);

    if (!isVerified) {
      throw new ForbiddenException('Invalid token!');
    }

    const decode = await this.jwtService.decode(payload.resetToken);
    const user = await this.userRepository.findOneBy({ id: decode.id });

    if (!user) {
      throw new ForbiddenException('Something went wrong, try again!');
    }

    if (user.otp !== payload.otp) {
      throw new ForbiddenException('OTP not matched!');
    }

    user.otp = '';

    await this.userRepository.save(user);

    const jwtPayload = {
      id: user.id,
    };

    // generate token
    const resetToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: this.config.getOrThrow('RESET_TOKEN_EXPIRES_IN'),
    });

    return {
      resetToken,
    };
  }

  async resetPassword(payload: ResetPasswordAuthDto) {
    const isVerified = await this.jwtService.verifyAsync(payload.resetToken);

    if (!isVerified) {
      throw new ForbiddenException('Invalid token!');
    }
    // decode token
    const decode = await this.jwtService.decode(payload.resetToken);
    const user = await this.userRepository.findOneBy({ id: decode.id });

    if (!user) {
      throw new NotFoundException('Something went wrong!');
    }

    const hashedPassword = await this.bcrypt.hashPassword(payload.password);

    user.password = hashedPassword;

    await this.userRepository.save(user);

    return;
  }

  async changePassword(user, payload: ChangePasswordAuthDto) {
    const userData = await this.userRepository.findOneBy({ id: user.id })

    if (!userData) {
      throw new NotFoundException('Something went wrong!');
    }

    const matched = await this.bcrypt.comparePasswords(payload.oldPassword, userData.password);

    if (!matched) {
      throw new ForbiddenException('Old password not matched!');
    }

    const hashedPassword = await this.bcrypt.hashPassword(payload.password);

    userData.password = hashedPassword;

    return;
  }

  async remove(user) {
    const userData = await this.userRepository.findOneBy({ id: user.id });

    if (!userData) {
      throw new NotFoundException('User not found!');
    }

    await this.userRepository.remove(userData);

    return;
  }
}

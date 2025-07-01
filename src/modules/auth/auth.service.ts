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
import { OtpSendMethod, VerificaitonCode } from '../user/entities/verification-code.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(VerificaitonCode) private verificationCodeRepository: Repository<VerificaitonCode>,
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
    const generatedOtp = this.emailService.generateNumericCode(6);
    const text = `
    You are creating an account using this email address.
    
    Your OTP (One-Time Password) is: ${generatedOtp}
    
    Please enter this code in the app to active your account.
    
    This code is valid for the next 5 minutes. If you did not request this, please ignore this email.
    `;
    const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p>You are creating an account using this email address.</p>
    <p><strong>Your OTP (One-Time Password) is:</strong></p>
    <div style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #2c3e50;">${generatedOtp}</div>
    <p>Please enter this code in the app to active your account.</p>
    <p style="color: #999;">This code is valid for the next 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    </div>
    `;


    const user = await this.userRepository.findOneBy({ email: payload.email });

    if (user) {
      throw new ForbiddenException('User already exists!');
    }

    await this.verificationCodeRepository.upsert(
      {
        email: payload.email,
        method: OtpSendMethod.EMAIL,
        otp: generatedOtp
      },
      ['email']
    );

    await this.emailService.sendMail(payload.email, "Email verification mail", text, html);

    const jwtPayload = { ...payload }
    const verificationToken = await this.jwtService.signAsync(jwtPayload);

    return {
      verificationToken
    };
  }

  async forgetPassword(payload: ForgetPasswordAuthDto) {
    const user = await this.userRepository.findOneBy({ email: payload.email });

    if (!user) {
      throw new NotFoundException('User not exists!');
    }

    const generatedOtp = this.emailService.generateNumericCode(6);

    const data = await this.verificationCodeRepository.create({
      email: user.email,
      otp: generatedOtp,
      method: OtpSendMethod.EMAIL
    })

    await this.verificationCodeRepository.save(data);

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

    await this.emailService.sendMail(
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
    let isVerified;
    if (payload.verificationToken) {
      isVerified = await this.jwtService.verifyAsync(payload.verificationToken);
    } else {
      isVerified = await this.jwtService.verifyAsync(payload.resetToken);
    }

    if (!isVerified) {
      throw new ForbiddenException('Otp expired, try again!');
    }

    let decode;
    if (payload.verificationToken) {
      decode = await this.jwtService.decode(payload.verificationToken);
    } else {
      decode = await this.jwtService.decode(payload.resetToken);
    }

    let user;
    let code;
    if (decode.id) {
      user = await this.userRepository.findOneBy({ id: decode.id });
      code = await this.verificationCodeRepository.findOneBy({ email: user.email });

      if (!code) {
        throw new ForbiddenException('Something went wrong, try again!');
      }

      if (payload.otp !== code.otp) {
        throw new ForbiddenException("Otp not matched!, try again!");
      }

    } else {

      code = await this.verificationCodeRepository.findOneBy({ email: decode.email });

      if (!code) {
        throw new ForbiddenException("Something went wrong, try again!");
      }

      if (payload.otp !== code.otp) {
        throw new ForbiddenException("Otp not matched, try again!");
      }

      decode.password = await this.bcrypt.hashPassword(decode.password);
      user = this.userRepository.create(decode);
      user = await this.userRepository.save(user);
    }

    await this.verificationCodeRepository.remove(code);

    if (!user) {
      throw new ForbiddenException('Something went wrong, try again!');
    }

    let jwtPayload;

    if (decode.id) {
      jwtPayload = {
        id: user.id,
      };
      const resetToken = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: this.config.getOrThrow('RESET_TOKEN_EXPIRES_IN'),
      });

      return {
        resetToken
      }
    } else {
      jwtPayload = {
        id: user.id,
        role: user.role
      }

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    }

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

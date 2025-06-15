import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtHelperModule } from 'src/config/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from 'src/common/nodemailer/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtHelperModule, ConfigModule, CloudinaryModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }

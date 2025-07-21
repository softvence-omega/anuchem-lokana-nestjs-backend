import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { EmailService } from './nodemailer/email.service';
import { BcryptService } from './bcrypt/bcrypt.service';

@Module({
  providers: [CloudinaryService, EmailService, BcryptService],
  exports: [CloudinaryService, EmailService, BcryptService],
})
export class CommonModule {}

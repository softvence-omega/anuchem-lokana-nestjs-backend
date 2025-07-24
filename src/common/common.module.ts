import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { EmailService } from './nodemailer/email.service';
import { BcryptService } from './bcrypt/bcrypt.service';
import { HelperService } from './utils/helper.service';
import { MessageService } from './message/message.service';

@Module({
  providers: [CloudinaryService, EmailService, BcryptService, HelperService, MessageService],
  exports: [CloudinaryService, EmailService, BcryptService, HelperService, MessageService],
})
export class CommonModule { }

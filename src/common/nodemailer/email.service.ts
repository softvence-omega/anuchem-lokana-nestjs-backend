import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    const user = this.config.getOrThrow<string>('SMTP_AUTH_USER');
    const pass = this.config.getOrThrow<string>('SMTP_AUTH_PASS');

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    // Optional: Verify SMTP configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Error configuring SMTP transporter', error);
      } else {
        this.logger.log('SMTP transporter is ready to send emails');
      }
    });
  }

  public async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `Support Team`,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw new Error('Failed to send email. Please try again later.');
    }
  }

  public generateNumericCode(length: number): string {
    if (length <= 0) {
      throw new Error('Digit length must be greater than 0');
    }

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const code = Math.floor(min + Math.random() * (max - min + 1));
    return code.toString();
  }
}

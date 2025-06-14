import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            auth: {
                user: this.configService.get<string>('SMTP_AUTH_USER'),
                pass: this.configService.get<string>('SMTP_AUTH_PASS'),
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        await this.transporter.sendMail({
            from: this.configService.get<string>('SMTP_AUTH_USER'),
            to,
            subject,
            text: 'Reset password within 10 minutes!',
            html,
        });
    }

    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

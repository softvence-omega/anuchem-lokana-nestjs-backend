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

    public async sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
        await this.transporter.sendMail({
            from: `Support Team`,
            to,
            subject,
            text,
            html,
        });
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

// message.service.ts
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageService {
    private africasTalking;

    constructor(config: ConfigService) {
        try {
            this.africasTalking = require("africastalking")({
                apiKey: config.getOrThrow("AFRICASTALKING_API_KEY"),
                username: config.getOrThrow("AFRICASTALKING_USERNAME")
            })
        } catch (e) {
            throw new e;
        }
    }

    async sendSms(to: string | string[], message: string, from?: string): Promise<any> {
        try {
            const sms = this.africasTalking.SMS;

            const options = {
                to,
                message,
                ...(from && { from }),
            };

            const response = await sms.send(options);
            return response;
        } catch (error) {
            console.error('SMS sending failed:', error);
            throw new InternalServerErrorException('Failed to send SMS');
        }
    }
}

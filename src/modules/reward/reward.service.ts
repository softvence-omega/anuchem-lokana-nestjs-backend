import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RewardService {
    private accessToken: string;
    private tokenExpiry: number;

    constructor(private configService: ConfigService) { }

    private async authenticate() {
        const now = Date.now();

        // Only fetch new token if expired
        if (this.accessToken && this.tokenExpiry > now) {
            return this.accessToken;
        }

        const response = await axios.post(
            `${this.configService.get('RELOADLY_AUTH_URL')}/oauth/token`,
            {
                client_id: this.configService.get('RELOADLY_LOKANA_REWARDS_ENGINE_API_KEY_ID'),
                client_secret: this.configService.get('RELOADLY_LOKANA_REWARDS_ENGINE_API_KEY'),
                grant_type: 'client_credentials',
                audience: 'https://topups.reloadly.com',
            },
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );

        this.accessToken = response.data.access_token;
        this.tokenExpiry = now + response.data.expires_in * 1000;

        return this.accessToken;
    }

    async getOperatorsByCountry(countryCode: string) {
        const token = await this.authenticate();
        console.log(token);
        const url = `https://topups-sandbox.reloadly.com/operators/countries/${countryCode}`;
        console.log(url);
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/com.reloadly.topups-v1+json',
            },
        });

        return response.data;
    }

    async sendTopUp(phoneNumber: string, amount: number, operatorId: number) {
        const token = await this.authenticate();
        const url = `${this.configService.get('RELOADLY_API_URL')}/topups`;

        const response = await axios.post(
            url,
            {
                operatorId,
                amount,
                useLocalAmount: true,
                customIdentifier: 'MyTx12345',
                recipientPhone: {
                    countryCode: 'NG',
                    number: phoneNumber,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/com.reloadly.topups-v1+json',
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    }
}

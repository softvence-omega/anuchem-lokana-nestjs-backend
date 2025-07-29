import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { TopUpDto } from './dto/top-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RewardService {
    private accessToken: string;
    private tokenExpiry: number;

    constructor(private configService: ConfigService, @InjectRepository(User) private userRepository: Repository<User>) { }

    private async authenticate() {
        const now = Date.now();

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

    async getCountries() {
        const token = await this.authenticate();
        const url = `${this.configService.getOrThrow("RELOADLY_API_URL")}/countries`;
        console.log(url);
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/com.reloadly.topups-v1+json',
            },
        });

        return response.data;
    }


    async getOperatorsByCountry(countryCode: string) {
        const token = await this.authenticate();
        const url = `${this.configService.getOrThrow("RELOADLY_API_URL")}/operators/countries/${countryCode}`;
        console.log(url);
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/com.reloadly.topups-v1+json',
            },
        });

        return response.data;
    }

    async sendTopUp(user, body: TopUpDto) {
        const { operatorId, amount, phoneNumber, countryIsoName, reward_points } = body;
        const userData = await this.userRepository.findOneBy({ id: user.id });

        if (!userData) {
            throw new ForbiddenException('Something went wrong!');
        }

        const token = await this.authenticate();

        if (!token) {
            throw new ForbiddenException('Invalid User!');
        }

        // const url = `${this.configService.get('RELOADLY_API_URL')}/topups`;
        // const response = await axios.post(
        //     url,
        //     {
        //         operatorId,
        //         amount,
        //         useLocalAmount: true,
        //         customIdentifier: userData.id,
        //         recipientPhone: {
        //             countryCode: countryIsoName,
        //             number: phoneNumber,
        //         },
        //     },
        //     {
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //             Accept: 'application/com.reloadly.topups-v1+json',
        //             'Content-Type': 'application/json',
        //         },
        //     },
        // );

        return {
            ...body,
            user: userData.id
        };
    }
}

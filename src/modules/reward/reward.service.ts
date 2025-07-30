import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { TopUpDto } from './dto/top-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { RewardOption } from './entities/reward-option.entity';
import { CreateRewardOptionDto } from './dto/create-reward-option.dto';
import { RewardHistory } from './entities/reward-history.entity';

@Injectable()
export class RewardService {
    private accessToken: string;
    private tokenExpiry: number;

    constructor(
        private configService: ConfigService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Reward) private rewardRepository: Repository<Reward>,
        @InjectRepository(RewardOption) private rewardOptionRepository: Repository<RewardOption>,
        @InjectRepository(RewardHistory) private rewardHistoryRepository: Repository<RewardHistory>
    ) { }

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

    async getRewardPoints(user) {
        const rewardPoints = await this.rewardRepository.findOneBy({ user: { id: user.id } });

        if (!rewardPoints) {
            throw new NotFoundException("User didn't achieved any reward points");
        }

        return rewardPoints;
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

    async getAllRewardOptions() {
        const data = await this.rewardOptionRepository.find();

        if (!data) {
            throw new NotFoundException('Not options are found!');
        }

        return data;
    }


    async createRewardOption(payload: CreateRewardOptionDto, user) {
        try {
            const data = await this.rewardOptionRepository.create({
                ...payload
            })

            return await this.rewardOptionRepository.save(data);
        } catch (err) {
            throw err
        }
    }

    async getRewardHistory(user) {
        try {
            const data = await this.rewardHistoryRepository.find({
                where: { user: { id: user.id } }
            });

            if (!data) {
                throw new NotFoundException('No data found');
            }

            return data;
        } catch (err) {
            throw err
        }
    }
}

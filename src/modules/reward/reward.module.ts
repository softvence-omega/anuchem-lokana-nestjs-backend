import { Module } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Reward } from './entities/reward.entity';
import { RewardOption } from './entities/reward-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reward, RewardOption])],
  controllers: [RewardController],
  providers: [RewardService],
})
export class RewardModule { }

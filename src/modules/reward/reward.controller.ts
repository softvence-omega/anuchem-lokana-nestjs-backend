import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RewardService } from './reward.service';
import { Public } from 'src/common/utils/public.decorator';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Public()
  @Get('operators/:countryCode')
  async getOperators(@Param('countryCode') code: string) {
    return await this.rewardService.getOperatorsByCountry(code);
  }

  @Post('topup')
  topup(@Body() body: { phone: string; amount: number; operatorId: number }) {
    return this.rewardService.sendTopUp(body.phone, body.amount, body.operatorId);
  }
}


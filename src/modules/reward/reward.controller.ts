import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RewardService } from './reward.service';
import { Public } from 'src/common/utils/public.decorator';
import { sendResponse } from 'src/common/utils/sendResponse';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Public()
  @Get('operators/:countryCode')
  async getOperators(@Param('countryCode') code: string) {
    const result = await this.rewardService.getOperatorsByCountry(code);
    return sendResponse(
      "Fetched",
      result
    )
  }

  @Post('topup')
  topup(@Body() body: { phone: string; amount: number; operatorId: number }) {
    return this.rewardService.sendTopUp(body.phone, body.amount, body.operatorId);
  }
}


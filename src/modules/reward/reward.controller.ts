import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { RewardService } from './reward.service';
import { Public } from 'src/common/utils/public.decorator';
import { sendResponse } from 'src/common/utils/sendResponse';
import { TopUpDto } from './dto/top-up.dto';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @ApiSecurity('accessToken')
  @Get('points')
  async getRewardPoints(@Req() req) {
    const result = await this.rewardService.getRewardPoints(req.user);
    return sendResponse(
      "Users reward points fetched",
      result
    )
  }

  @ApiSecurity('accessToken')
  @Get('countries')
  async getCountries() {
    const result = await this.rewardService.getCountries();
    return sendResponse(
      "All Operator fetched by country",
      result
    )
  }

  @ApiSecurity('accessToken')
  @Get('operators/:countryIsoName')
  async getOperators(@Param('countryIsoName') code: string) {
    const result = await this.rewardService.getOperatorsByCountry(code);
    return sendResponse(
      "All Operator fetched by country",
      result
    )
  }

  @ApiSecurity('accessToken')
  @Post('topup')
  async topup(@Body() body: TopUpDto, @Req() req) {
    const result = await this.rewardService.sendTopUp(req.user, body);
    return sendResponse(
      "Your top-up request was successful!",
      result
    )
  }
}


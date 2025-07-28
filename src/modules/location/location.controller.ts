import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Req,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiBody, ApiConsumes, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateLocationSimSelfieDto } from './dto/create-location-sim-selfie.dto';
import { sendResponse } from 'src/common/utils/sendResponse';
import { CreateLocationNidOcrDto } from './dto/create-location-nid-ocr.dto';
import { CreateLocationApiVerificationDto } from './dto/create-location-api-verfication.dto';
import { CreateLocationForVerifyDto } from './dto/create-location-for-verify.dto';
import { CreateLocationAgentCodeDto } from './dto/create-location-agent-code.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SendVerificationOtpDto } from './dto/sendVerificationOtp.dto';
import { OtpVerificationDto } from './dto/otp-verification.dto';
import { LocationReactionDto } from './dto/location-reaction.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @ApiSecurity('accessToken')
  @ApiConsumes('multipart/form-data')
  @Post('sim-with-selfie')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'selfie', maxCount: 1 },
      // { name: 'photos', maxCount: 3 },
    ]),
  )
  async createSimSelfieLocation(
    @Req() req,
    @Body() payload: CreateLocationSimSelfieDto,
    @UploadedFiles()
    files: {
      selfie: Express.Multer.File[];
      photos: Express.Multer.File[];
    },
  ) {
    const result = await this.locationService.createSimSelfieLocation(
      req.user,
      payload,
      files.selfie,
      // files.photos,
    );
    return sendResponse(
      'Location with Sim and Selfie saved successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'doc', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
      // { name: 'photos', maxCount: 3 },
    ]),
  )
  @Post('nationalId-with-ocr')
  async createNidOcrLocation(
    @Req() req,
    @Body() payload: CreateLocationNidOcrDto,
    @UploadedFiles()
    files: {
      selfie: Express.Multer.File[];
      // photos: Express.Multer.File[];
      doc: Express.Multer.File[];
    },
  ) {
    console.log(req.user);
    const result = await this.locationService.createNidOcrLocation(
      req.user,
      payload,
      files.selfie,
      files.doc,
      // files.photos,
    );
    return sendResponse(
      'Location with National ID and OCR saved successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'doc', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ]),
  )
  @Post('api-verification')
  async createLocationApiVerification(
    @Req() req,
    @Body() payload: CreateLocationApiVerificationDto,
    @UploadedFiles()
    files: {
      selfie: Express.Multer.File[];
      doc: Express.Multer.File[];
    },
  ) {
    const result = await this.locationService.createLocationApiVerification(
      req.user,
      payload,
      files.selfie,
      files.doc,
    );
    return sendResponse(
      'Location with Api verification saved successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 3 }]))
  @Post('community')
  async createLocationVerification(
    @Req() req,
    @Body() payload: CreateLocationForVerifyDto,
    @UploadedFiles()
    files: {
      photos: Express.Multer.File[];
    },
  ) {
    const result = await this.locationService.createLocationVerification(
      req.user,
      payload,
      files.photos,
    );
    return sendResponse(
      'Location for verification saved successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @Post('agent-code')
  async createLocationAgentCode(@Req() req, @Body() payload: CreateLocationAgentCodeDto) {
    const result = await this.locationService.createLocationAgentCode(req.user, payload);
    return sendResponse(
      'Location for verification saved successfully!',
      result,
    );
  }

  @ApiSecurity('accessToken')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'doc', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
      { name: 'photos', maxCount: 3 },
    ]),
  )
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() payload: UpdateLocationDto,
    @UploadedFiles()
    files: {
      selfies: Express.Multer.File[];
      photos: Express.Multer.File[];
      docs: Express.Multer.File[];
    },
  ) {
    const result = await this.locationService.update(id, payload, req.user, files.selfies, files.photos, files.docs);
    return sendResponse('Location updated successfully!', result);
  }

  @ApiSecurity('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const result = await this.locationService.remove(id, req.user);
    return sendResponse("Location removed successfully!", result);
  }

  @ApiSecurity('accessToken')
  @Post('send-verification-otp-sms')
  async sendVerificationOtpMessage(@Body() payload: SendVerificationOtpDto) {
    const result =
      await this.locationService.sendVerificationOtpMessage(payload);
    return sendResponse('Verification sms sent successfully!', result);
  }

  @ApiSecurity('accessToken')
  @Post('verify-otp')
  async verifyOtp(@Body() payload: OtpVerificationDto) {
    const result = await this.locationService.verifyOtp(payload);
    return sendResponse('Otp has been verified successfully!', result);
  }

  @ApiSecurity('accessToken')
  @Post(':id/reaction')
  async reactToLocation(
    @Req() req,
    @Param('id') locationId: string,
    @Body() payload: LocationReactionDto,
  ) {
    const user = req.user;
    const { reactionType } = payload;

    const result = await this.locationService.reactToLocation(user, locationId, reactionType);

    return sendResponse('Reaction updated successfully!', result);
  }

  @ApiSecurity("accessToken")
  @Get('self')
  async getMyLocations(@Req() req) {
    const result = await this.locationService.getMyLocations(req.user);
    return sendResponse("Your created all locations are fetched!", result);
  }


  @ApiSecurity("accessToken")
  @Get('nearby')
  @ApiQuery({ name: 'lat', type: 'number', example: 51.5074 })
  @ApiQuery({ name: 'lng', type: 'number', example: -0.123 })
  async getLocationsInTwentyKilometer(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Req() req,
  ) {
    const result = await this.locationService.getLocationsInTwentyKilometer(latitude, longitude, req.user);
    return sendResponse('Nearby locations within 20km fetched successfully.', result);
  }
}

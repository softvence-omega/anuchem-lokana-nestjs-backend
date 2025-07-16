import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Req } from '@nestjs/common';
import { LocationService } from './location.service';;
import { ApiConsumes, ApiSecurity } from '@nestjs/swagger';
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

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @ApiSecurity("accessToken")
  @ApiConsumes("multipart/form-data")
  @Post('sim-with-selfie')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'selfie', maxCount: 1 },
    { name: 'photos', maxCount: 3 }
  ]))
  async createSimSelfieLocation(
    @Req() req,
    @Body() payload: CreateLocationSimSelfieDto,
    @UploadedFiles() files: {
      selfie: Express.Multer.File[],
      photos: Express.Multer.File[]
    }
  ) {
    const result = await this.locationService.createSimSelfieLocation(req.user, payload, files.selfie, files.photos);
    return sendResponse(
      "Location with Sim and Selfie saved successfully!",
      result
    )
  }


  @ApiSecurity("accessToken")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'doc', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'photos', maxCount: 3 }
  ]))
  @Post('nationalId-with-ocr')
  async createNidOcrLocation(
    @Body() payload: CreateLocationNidOcrDto,
    @UploadedFiles() files: {
      selfie: Express.Multer.File[],
      photos: Express.Multer.File[],
      doc: Express.Multer.File[]
    }
  ) {
    const result = await this.locationService.createNidOcrLocation(payload, files.selfie, files.doc, files.photos);
    return sendResponse(
      "Location with National ID and OCR saved successfully!",
      result
    )
  }

  @ApiSecurity("accessToken")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'doc', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]))
  @Post('api-verification')
  async createLocationApiVerification(
    @Body() payload: CreateLocationApiVerificationDto,
    @UploadedFiles() files: {
      selfie: Express.Multer.File[],
      doc: Express.Multer.File[]
    }
  ) {
    const result = await this.locationService.createLocationApiVerification(payload, files.selfie, files.doc);
    return sendResponse(
      "Location with Api verification saved successfully!",
      result
    )
  }

  @ApiSecurity("accessToken")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'photos', maxCount: 3}
  ]))
  @Post('api-verification')
  async createLocationVerification(
    @Body() payload: CreateLocationForVerifyDto,
    @UploadedFiles() files: {
      photos: Express.Multer.File[]
    }
  ) {
    const result = await this.locationService.createLocationVerification(payload, files.photos);
    return sendResponse(
      "Location for verification saved successfully!",
      result
    )
  }

  @ApiSecurity("accessToken")
  @Post('agent-code')
  async createLocationAgentCode(@Body() payload: CreateLocationAgentCodeDto) {
    const result = await this.locationService.createLocationAgentCode(payload);
    return sendResponse(
      "Location for verification saved successfully!",
      result
    )
  }

  @ApiSecurity("accessToken")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'doc', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'photos', maxCount: 3 }
  ]))
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() payload: UpdateLocationDto,
    @UploadedFiles() files: {
      selfie: Express.Multer.File[],
      photos: Express.Multer.File[],
      doc: Express.Multer.File[]
    }
  ) {
    const result = await this.locationService.update(id, payload);
    return sendResponse(
      "Location updated successfully!",
      result
    )
  }

  @ApiSecurity("accessToken")
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }

  @ApiSecurity("accessToken")
  @Post('send-verification-otp-sms')
  async sendVerificationOtpMessage(@Body() payload: SendVerificationOtpDto){
    const result = await this.locationService.sendVerificationOtpMessage(payload);
    return sendResponse(
      "Verification sms sent successfully!",
      result
    )
  }

  @ApiSecurity("accessToken")
  @Post('verify-otp')
  async verifyOtp(@Body() payload:OtpVerificationDto){
    const result = await this.locationService.verifyOtp(payload);
    return sendResponse(
      "Otp has been verified successfully!",
      result
    )
  }
}

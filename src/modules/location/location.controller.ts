import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { LocationService } from './location.service';;
import { ApiConsumes, ApiSecurity } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateLocationSimSelfieDto } from './dto/create-location-sim-selfie.dto';
import { sendResponse } from 'src/common/utils/sendResponse';
import { CreateLocationNidOcrDto } from './dto/create-location-nid-ocr.dto';

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
    @Body() payload: CreateLocationSimSelfieDto,
    @UploadedFiles() files: {
      selfie: Express.Multer.File[],
      photos: Express.Multer.File[]
    }
  ) {
    const result = await this.locationService.createSimSelfieLocation(payload, files.selfie, files.photos);
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
  @Post('national-with-ocr')
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

  @Post()
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}

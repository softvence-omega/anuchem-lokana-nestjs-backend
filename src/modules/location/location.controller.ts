import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/utils/public.decorator';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @ApiConsumes("multipart/form-data")
  @Public()
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'selfie', maxCount: 1 },
    { name: 'doc', maxCount: 1 },
    { name: 'utility_doc', maxCount: 1 }
  ]))
  create(@Body() createLocationDto: CreateLocationDto, @UploadedFiles() files: { selfie: Express.Multer.File[], doc: Express.Multer.File[], utility_doc: Express.Multer.File[] }) {
    console.dir(files);
    console.dir(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}

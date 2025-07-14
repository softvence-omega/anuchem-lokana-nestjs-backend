import { Injectable } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateLocationSimSelfieDto } from './dto/create-location-sim-selfie.dto';
import { CreateLocationNidOcrDto } from './dto/create-location-nid-ocr.dto';
import { CreateLocationApiVerificationDto } from './dto/create-location-api-verfication.dto';
import { CreateLocationForVerifyDto } from './dto/create-location-for-verify.dto';
import { CreateLocationAgentCodeDto } from './dto/create-location-agent-code.dto';
import { SendVerificationOtpDto } from './dto/sendVerificationOtp.dto';
import { EmailService } from 'src/common/nodemailer/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificaitonCode } from '../user/entities/verification-code.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService {

  constructor(
    private emailService: EmailService,
    @InjectRepository(VerificaitonCode) private verificationCode: Repository<VerificaitonCode>
  ){}

  async createSimSelfieLocation(
    payload: CreateLocationSimSelfieDto, 
    selfies: Express.Multer.File[], 
    photos: Express.Multer.File[]
  ){
    
  }

  async createNidOcrLocation(
    payload: CreateLocationNidOcrDto, 
    selfies: Express.Multer.File[], 
    docs: Express.Multer.File[], 
    photos: Express.Multer.File[]
  ){

  }

  async createLocationApiVerification(
    payload: CreateLocationApiVerificationDto, 
    seflies: Express.Multer.File[], 
    docs: Express.Multer.File[]
  ){

  }

  async createLocationVerification(
    payload: CreateLocationForVerifyDto, 
    photos: Express.Multer.File[]
  ){

  }

  async createLocationAgentCode(payload: CreateLocationAgentCodeDto){

  }

  update(id: string, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  remove(id: string) {
    return `This action removes a #${id} location`;
  }

  async sendVerificationOtpMessage(payload: SendVerificationOtpDto) {
    const generatedCode = this.emailService.generateNumericCode(6);
    const data = await this.verificationCode.create(payload);
  }
}

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { JwtService } from '@nestjs/jwt';
import { OtpVerificationDto } from './dto/otp-verification.dto';
import { Location } from './entities/location.entity';
import { LocationApiVerificationInfo } from './entities/location-api-verification-info.entity';
import { LocationImage } from './entities/location-selfie.entity';
import { LocationDocs } from './entities/location-docs.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class LocationService {

  constructor(
    private emailService: EmailService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService,
    @InjectRepository(VerificaitonCode) private verificationCode: Repository<VerificaitonCode>,
    @InjectRepository(Location) private location: Repository<Location>,
    @InjectRepository(LocationApiVerificationInfo) private locationApiVerificationInfo: Repository<LocationApiVerificationInfo>,
    @InjectRepository(LocationImage) private locationImage: Repository<LocationImage>,
    @InjectRepository(LocationDocs) private locationDoc: Repository<LocationDocs>
  ){}

  async createSimSelfieLocation(
    payload: CreateLocationSimSelfieDto, 
    selfies: Express.Multer.File[], 
    photos: Express.Multer.File[]
  ){
    const isVerified = await this.jwtService.verifyAsync(payload.verified_token);
    if(!isVerified){
      throw new ForbiddenException("Something went wrong! try again");
    }

    const {code_id, phone} = this.jwtService.decode(payload.verified_token);

    const code = await this.verificationCode.findOneBy({id: code_id});

    if(!code){
      throw new ForbiddenException("Something went wrong! try again");
    }

    if(code.phone !== phone){
      throw new ForbiddenException("Something went wrong! try again");
    }

    if(phone !== payload.phone){
      throw new ForbiddenException("The phone number is incorrect! check and try again");
    }

    if(selfies.length > 0){
      const urls = await Promise.all(
          selfies.map(async (selfie) => {
            const result = await this.cloudinary.uploadFile(selfie);
            return result.secure_url;
          })
        );
    }

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

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }

  async remove(id: string) {
    return `This action removes a #${id} location`;
  }

  async sendVerificationOtpMessage(payload: SendVerificationOtpDto) {
    const generatedCode = this.emailService.generateNumericCode(6);

    let phone = await this.verificationCode.findOneBy({phone: payload.phone});

    if(phone){
      phone.otp = generatedCode;
      await this.verificationCode.save(phone);
    } else {
      phone = await this.verificationCode.create({...payload, otp: generatedCode});
      phone = await this.verificationCode.save(phone);
    }
    // @TODO:send local message

    //generate token
    const jwtPayload = {
      phone_id: phone.id
    }

    const token = await this.jwtService.signAsync(jwtPayload);

    return {
      sms_token: token
    };
  }

  async verifyOtp(payload:OtpVerificationDto){
    const isMatched = await this.jwtService.verifyAsync(payload.sms_token);
    if(!isMatched){
      throw new ForbiddenException("Otp expired! try again");
    }

    const {phone_id} = this.jwtService.decode(payload.sms_token);

    const code = await this.verificationCode.findOneBy({id: phone_id});

    if(!code){
      throw new NotFoundException("Something went wrong! try again");
    }

    if(code.otp !== payload.otp){
      throw new ForbiddenException("Otp did not matched! try again");
    }

    const jwtPayload = {
      code_id: code.id,
      phone: code.phone
    }

    const verified_token = await this.jwtService.signAsync(jwtPayload);

    return {
      verified_token
    }
  }
}

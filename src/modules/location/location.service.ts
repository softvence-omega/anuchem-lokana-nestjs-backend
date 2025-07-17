import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateLocationSimSelfieDto } from './dto/create-location-sim-selfie.dto';
import { CreateLocationNidOcrDto } from './dto/create-location-nid-ocr.dto';
import { CreateLocationApiVerificationDto } from './dto/create-location-api-verfication.dto';
import { CreateLocationForVerifyDto } from './dto/create-location-for-verify.dto';
import { CreateLocationAgentCodeDto } from './dto/create-location-agent-code.dto';
import { SendVerificationOtpDto } from './dto/sendVerificationOtp.dto';
import { EmailService } from 'src/common/nodemailer/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpSendMethod, VerificaitonCode } from '../user/entities/verification-code.entity';
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
    user,
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

    const image = await this.locationImage.create();

    if(selfies.length > 0){
      const result = await this.cloudinary.uploadFile(selfies[0], 'selfies');
      image.selfie = result['secure_url'];
    }

    if(photos.length > 0){
      const image_urls = await Promise.all(
          photos.map(async (photo) => {
            const result = await this.cloudinary.uploadFile(photo, 'location_photos');
            return result['secure_url'];
          })
      );

      image.images = image_urls;
    }

    await this.locationImage.save(image);

    const location = await this.location.create({
      gps_code: payload.gps_code,
      phone: payload.phone,
      region: payload.region,
      street_name: payload.street_name,
      images: image,
      district: payload.district,
      user: user.id
    });

    return await this.location.save(location);

  }

  async createNidOcrLocation(
    user,
    payload: CreateLocationNidOcrDto, 
    selfies: Express.Multer.File[], 
    docs: Express.Multer.File[], 
    photos: Express.Multer.File[]
  ){

    const locaionDataExist = await this.location.findOneBy({
      gps_code: payload.gps_code
    })

    if(locaionDataExist){
      throw new ConflictException("Location already exist!");
    }

    let image;

    if(selfies.length > 0){
      const result = await this.cloudinary.uploadFile(selfies[0], 'selfies');
      image = image ? image : await this.locationImage.create();
      image.selfie = result['secure_url'];
    }

    if(photos.length > 0){
      const image_urls = await Promise.all(
          photos.map(async (photo) => {
            const result = await this.cloudinary.uploadFile(photo, 'location_photos');
            return result['secure_url'];
          })
      );

      image = image ? image : await this.locationImage.create();
      image.images = image_urls;
    }

    let doc;
    if(docs.length > 0){
      const result = await this.cloudinary.uploadFile(docs[0], 'documents');
      doc = doc ? doc : await this.locationDoc.create({
        doc: result['secure_url'],
        doc_type: "NATIONAL ID",
      });
    }

    if(doc){
      await this.locationDoc.save(doc);
    }

    if(image){
      await this.locationImage.save(image);
    }

    const location = await this.location.create({
      gps_code: payload.gps_code,
      street_name: payload.street_name,
      region: payload.region,
      doc: doc ? doc : '',
      images: image ? image : '',
      user: user.id,
      district: payload.district
    })

    return await this.location.save(location);
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
      phone = await this.verificationCode.create({...payload, otp: generatedCode, method: OtpSendMethod.SMS});
      phone = await this.verificationCode.save(phone);
    }
    // @TODO:send local message

    //generate token
    const jwtPayload = {
      phone_id: phone.id
    }

    const token = await this.jwtService.signAsync(jwtPayload);

    return {
      sms_token: token,
      otp: generatedCode //@TODO: need to remove from here
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

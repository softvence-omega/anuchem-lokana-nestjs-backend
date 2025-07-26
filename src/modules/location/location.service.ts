import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateLocationSimSelfieDto } from './dto/create-location-sim-selfie.dto';
import { CreateLocationNidOcrDto } from './dto/create-location-nid-ocr.dto';
import { CreateLocationApiVerificationDto } from './dto/create-location-api-verfication.dto';
import { CreateLocationForVerifyDto } from './dto/create-location-for-verify.dto';
import { CreateLocationAgentCodeDto } from './dto/create-location-agent-code.dto';
import { SendVerificationOtpDto } from './dto/sendVerificationOtp.dto';
import { EmailService } from 'src/common/nodemailer/email.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  OtpSendMethod,
  VerificaitonCode,
} from '../user/entities/verification-code.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OtpVerificationDto } from './dto/otp-verification.dto';
import { Location } from './entities/location.entity';
import { LocationApiVerificationInfo } from './entities/location-api-verification-info.entity';
import { LocationImage } from './entities/location-selfie.entity';
import { LocationDocs } from './entities/location-docs.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { User } from '../user/entities/user.entity';
import { LocationReaction, ReactionType } from './entities/location-reaction';
import { HelperService } from 'src/common/utils/helper.service';

@Injectable()
export class LocationService {
  constructor(
    private emailService: EmailService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService,
    private helper: HelperService,
    @InjectRepository(VerificaitonCode)
    private verificationCode: Repository<VerificaitonCode>,
    @InjectRepository(Location) private location: Repository<Location>,
    @InjectDataSource() private dataSource: DataSource,
  ) { }

  async createSimSelfieLocation(
    user,
    payload: CreateLocationSimSelfieDto,
    selfies: Express.Multer.File[],
    photos: Express.Multer.File[],
  ) {
    const isVerified = await this.jwtService.verifyAsync(
      payload.verified_token,
    );
    if (!isVerified) {
      throw new ForbiddenException('Something went wrong! Try again.');
    }

    const { code_id, phone } = this.jwtService.decode(payload.verified_token);
    const code = await this.verificationCode.findOneBy({ id: code_id });

    if (!code || code.phone !== phone || phone !== payload.phone) {
      throw new ForbiddenException(
        'The phone number is incorrect or verification failed.',
      );
    }

    const uploadedFilePath: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const existingLocation = await manager.findOneBy(Location, {
          gps_code: payload.gps_code,
        });

        if (existingLocation) {
          throw new ConflictException('Location already exists!');
        }

        const image = manager.create(LocationImage);

        if (selfies.length > 0) {
          const selfieUpload = await this.cloudinary.uploadFile(
            selfies[0],
            'selfies',
          );
          uploadedFilePath.push(selfieUpload.secure_url);
          image.selfie = selfieUpload['secure_url'];
        }

        if (photos.length > 0) {
          const photoUrls = await Promise.all(
            photos.map(async (photo) => {
              const result = await this.cloudinary.uploadFile(
                photo,
                'location_photos',
              );
              uploadedFilePath.push(result.secure_url);
              return result['secure_url'];
            }),
          );
          image.images = photoUrls;
        }

        await manager.save(LocationImage, image);

        const location = manager.create(Location, {
          gps_code: payload.gps_code,
          phone: payload.phone,
          region: payload.region,
          street_name: payload.street_name,
          images: image,
          district: payload.district,
          user: user.id,
        });

        return await manager.save(Location, location);
      });
    } catch (err) {
      for (const path of uploadedFilePath) {
        const relativePath = this.cloudinary.extractPublicId(path);
        await this.cloudinary.destroyFile(relativePath);
      }
      throw err;
    }
  }

  async createNidOcrLocation(
    user,
    payload: CreateLocationNidOcrDto,
    selfies: Express.Multer.File[],
    docs: Express.Multer.File[],
    photos: Express.Multer.File[],
  ) {
    const uploadedFilePath: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const existingLocation = await manager.findOneBy(Location, {
          gps_code: payload.gps_code,
        });

        if (existingLocation) {
          throw new ConflictException('Location already exists!');
        }

        let image: LocationImage | null = null;
        if (selfies.length > 0) {
          const result = await this.cloudinary.uploadFile(
            selfies[0],
            'selfies',
          );
          uploadedFilePath.push(result.secure_url);
          image = manager.create(LocationImage, {
            selfie: result['secure_url'],
          });
        }

        if (photos.length > 0) {
          const imageUrls = await Promise.all(
            photos.map(async (photo) => {
              const result = await this.cloudinary.uploadFile(
                photo,
                'location_photos',
              );
              uploadedFilePath.push(result.secure_url);
              return result['secure_url'];
            }),
          );

          if (image) {
            image.images = imageUrls;
          } else {
            image = manager.create(LocationImage, { images: imageUrls });
          }
        }

        if (image) {
          await manager.save(LocationImage, image);
        }

        let doc: LocationDocs | null = null;
        if (docs.length > 0) {
          const result = await this.cloudinary.uploadFile(docs[0], 'documents');
          uploadedFilePath.push(result.secure_url);
          doc = manager.create(LocationDocs, {
            doc: result['secure_url'],
            doc_type: 'NATIONAL_ID',
          });
          await manager.save(LocationDocs, doc);
        }

        const location = manager.create(Location, {
          gps_code: payload.gps_code,
          street_name: payload.street_name,
          region: payload.region,
          district: payload.district,
          user: user.id,
          images: image ?? null,
          doc: doc ?? null,
        } as DeepPartial<Location>);

        return await manager.save(Location, location);
      });
    } catch (err) {
      for (const path of uploadedFilePath) {
        const relativePath = this.cloudinary.extractPublicId(path);
        await this.cloudinary.destroyFile(relativePath);
      }
      throw err;
    }
  }

  async createLocationApiVerification(
    user,
    payload: CreateLocationApiVerificationDto,
    selfies: Express.Multer.File[],
    docs: Express.Multer.File[],
  ) {
    const uploadedFilePath: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const locationDataExist = await manager.findOneBy(Location, {
          gps_code: payload.gps_code,
        });

        const userData = await manager.findOneBy(User, {
          id: user.id,
        });

        if (!userData) {
          throw new ForbiddenException('Something went wrong! try again!');
        }

        if (locationDataExist) {
          throw new ConflictException('Location already exists!');
        }

        let image: LocationImage | null = null;
        if (selfies.length > 0) {
          const result = await this.cloudinary.uploadFile(
            selfies[0],
            'selfies',
          );
          uploadedFilePath.push(result.secure_url);
          image = manager.create(LocationImage, {
            selfie: result.secure_url,
          });
          await manager.save(LocationImage, image);
        }

        let doc: LocationDocs | null = null;
        if (docs.length > 0) {
          const result = await this.cloudinary.uploadFile(docs[0], 'documents');
          uploadedFilePath.push(result.secure_url);
          doc = manager.create(LocationDocs, {
            doc: result.secure_url,
            doc_type: 'NATIONAL_ID',
          });
          await manager.save(LocationDocs, doc);
        }

        const apiVerificationInfo = manager.create(
          LocationApiVerificationInfo,
          {
            name: payload.full_name,
            country: payload.country,
            date_of_birth: payload.date_of_birth,
            national_id: payload.nid_number,
          },
        );

        await manager.save(LocationApiVerificationInfo, apiVerificationInfo);

        const location = manager.create(Location, {
          user: userData,
          gps_code: payload.gps_code,
          region: payload.region,
          street_name: payload.street_name,
          district: payload.district,
          images: image ?? null,
          doc: doc ?? null,
          apiVerificationInfo: apiVerificationInfo,
        } as DeepPartial<Location>);

        return await manager.save(Location, location);
      });
    } catch (err) {
      for (const path of uploadedFilePath) {
        const relativePath = this.cloudinary.extractPublicId(path);
        await this.cloudinary.destroyFile(relativePath);
      }
      throw err;
    }
  }

  async createLocationVerification(
    user,
    payload: CreateLocationForVerifyDto,
    photos: Express.Multer.File[],
  ) {
    const uploadedFilePath: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const locationData = await manager.findOneBy(Location, {
          gps_code: payload.gps_code,
        });

        if (locationData) {
          throw new ConflictException('Location already exist!');
        }

        const userData = await manager.findOneBy(User, {
          id: user.id,
        });

        if (!userData) {
          throw new NotFoundException('Something went wrong! try again');
        }

        let image: LocationImage | null = null;
        if (photos.length > 0) {
          const imageUrls = await Promise.all(
            photos.map(async (photo) => {
              const result = await this.cloudinary.uploadFile(photo);
              uploadedFilePath.push(result.secure_url);
              return result.secure_url;
            }),
          );
          image = await manager.create(LocationImage, {
            images: imageUrls,
          });
          await manager.save(LocationImage, image);
        }

        const location = await manager.create(Location, {
          gps_code: payload.gps_code,
          street_name: payload.street_name,
          region: payload.region,
          district: payload.district,
          images: image ?? null,
          user: userData,
        } as DeepPartial<Location>);

        return await manager.save(Location, location);
      });
    } catch (err) {
      for (const path of uploadedFilePath) {
        const relativePath = this.cloudinary.extractPublicId(path);
        await this.cloudinary.destroyFile(relativePath);
      }
      throw err;
    }
  }

  async createLocationAgentCode(user, payload: CreateLocationAgentCodeDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const locationData = await manager.findOneBy(Location, {
          gps_code: payload.gps_code,
        });

        if (locationData) {
          throw new ConflictException('Location already exist!');
        }

        const userData = await manager.findOneBy(User, {
          id: user.id,
        });

        if (!userData) {
          throw new NotFoundException('Something went wrong! try again');
        }

        const location = await manager.create(Location, {
          gps_code: payload.gps_code,
          street_name: payload.street_name,
          region: payload.region,
          district: payload.district,
          agent_code: payload.agent_code,
          user: userData,
        } as DeepPartial<Location>);

        return await manager.save(Location, location);
      });
    } catch (err) {
      throw err;
    }
  }

  async update(
    id: string,
    payload: UpdateLocationDto,
    user,
    selfies: Express.Multer.File[],
    photos: Express.Multer.File[],
    docs: Express.Multer.File[]
  ) {
    const uploadedFilePath: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const location = await manager.findOne(Location, {
          where: { id },
          relations: ['images', 'doc', 'apiVerificationInfo', 'user'],
        });

        if (!location) {
          throw new NotFoundException('Location not found');
        }

        if (location.user.id !== user.id) {
          throw new ForbiddenException('Only the owner can update this location');
        }

        if (selfies.length > 0) {
          const result = await this.cloudinary.uploadFile(selfies[0], 'selfies');
          uploadedFilePath.push(result.secure_url);

          if (location.images?.selfie) {
            const relativePath = this.cloudinary.extractPublicId(location.images.selfie);
            await this.cloudinary.destroyFile(relativePath);
            location.images.selfie = result.secure_url;
          } else {
            if (!location.images) {
              location.images = manager.create(LocationImage, {});
            }
            location.images.selfie = result.secure_url;
          }
        }

        if (photos.length > 0) {
          const photoUrls = await Promise.all(
            photos.map(async (photo) => {
              const result = await this.cloudinary.uploadFile(photo, 'location_photos');
              uploadedFilePath.push(result.secure_url);
              return result.secure_url;
            }),
          );

          if (location.images?.images?.length) {
            for (const oldUrl of location.images.images) {
              const relativePath = this.cloudinary.extractPublicId(oldUrl);
              await this.cloudinary.destroyFile(relativePath);
            }
          }

          if (!location.images) {
            location.images = manager.create(LocationImage, {});
          }

          location.images.images = photoUrls;
        }

        if (location.images) {
          await manager.save(LocationImage, location.images);
        }

        if (docs.length > 0) {
          const result = await this.cloudinary.uploadFile(docs[0], 'documents');
          uploadedFilePath.push(result.secure_url);

          if (location.doc?.doc) {
            const relativePath = this.cloudinary.extractPublicId(location.doc.doc);
            await this.cloudinary.destroyFile(relativePath);
            location.doc.doc = result.secure_url;
          } else {
            const newDoc = manager.create(LocationDocs, {
              doc: result.secure_url,
              doc_type: 'NATIONAL_ID',
            });
            await manager.save(LocationDocs, newDoc);
            location.doc = newDoc;
          }

          if (location.doc) {
            await manager.save(LocationDocs, location.doc);
          }
        }

        if (
          payload.full_name &&
          payload.nid_number &&
          payload.country &&
          payload.date_of_birth
        ) {
          if (location.apiVerificationInfo) {
            location.apiVerificationInfo.name = payload.full_name;
            location.apiVerificationInfo.national_id = payload.nid_number;
            location.apiVerificationInfo.country = payload.country;
            location.apiVerificationInfo.date_of_birth = payload.date_of_birth;
            await manager.save(LocationApiVerificationInfo, location.apiVerificationInfo);
          } else {
            const apiInfo = manager.create(LocationApiVerificationInfo, {
              name: payload.full_name,
              national_id: payload.nid_number,
              country: payload.country,
              date_of_birth: payload.date_of_birth,
            });
            await manager.save(LocationApiVerificationInfo, apiInfo);
            location.apiVerificationInfo = apiInfo;
          }
        }

        /** === 5. Update Basic Fields === **/
        location.gps_code = payload.gps_code ?? location.gps_code;
        location.region = payload.region ?? location.region;
        location.district = payload.district ?? location.district;
        location.street_name = payload.street_name ?? location.street_name;

        return await manager.save(Location, location);
      });
    } catch (err) {
      for (const path of uploadedFilePath) {
        const relativePath = this.cloudinary.extractPublicId(path);
        await this.cloudinary.destroyFile(relativePath);
      }
      throw err;
    }
  }


  async remove(id: string, user) {
    const location = await this.location.findOne({
      where: { id },
      relations: ['images', 'doc', 'apiVerificationInfo', 'user'],
    });

    if (!location) {
      throw new NotFoundException(`Location not found`);
    }

    if (location.user.id !== user.id) {
      throw new ForbiddenException('Only the owner can delete this location');
    }

    const toDeleteCloudinaryPaths: string[] = [];

    if (location.images?.selfie) {
      toDeleteCloudinaryPaths.push(location.images.selfie);
    }

    if (location.images?.images?.length) {
      toDeleteCloudinaryPaths.push(...location.images.images);
    }

    if (location.doc?.doc) {
      toDeleteCloudinaryPaths.push(location.doc.doc);
    }

    await this.dataSource.transaction(async (manager) => {
      // Delete associated entities
      if (location.images) {
        await manager.delete(LocationImage, location.images.id);
      }

      if (location.doc) {
        await manager.delete(LocationDocs, location.doc.id);
      }

      if (location.apiVerificationInfo) {
        await manager.delete(LocationApiVerificationInfo, location.apiVerificationInfo.id);
      }

      // Delete main location
      await manager.delete(Location, id);
    });

    // Remove Cloudinary files
    for (const path of toDeleteCloudinaryPaths) {
      const relativePath = this.cloudinary.extractPublicId(path);
      await this.cloudinary.destroyFile(relativePath);
    }

    return { message: 'Location deleted successfully' };
  }


  async sendVerificationOtpMessage(payload: SendVerificationOtpDto) {
    const generatedCode = this.emailService.generateNumericCode(6);

    let phone = await this.verificationCode.findOneBy({ phone: payload.phone });

    if (phone) {
      phone.otp = generatedCode;
      await this.verificationCode.save(phone);
    } else {
      phone = await this.verificationCode.create({
        ...payload,
        otp: generatedCode,
        method: OtpSendMethod.SMS,
      });
      phone = await this.verificationCode.save(phone);
    }
    // @TODO:send local message

    //generate token
    const jwtPayload = {
      phone_id: phone.id,
    };

    const token = await this.jwtService.signAsync(jwtPayload);

    return {
      sms_token: token,
      otp: generatedCode, //@TODO: need to remove from here
    };
  }

  async verifyOtp(payload: OtpVerificationDto) {
    const isMatched = await this.jwtService.verifyAsync(payload.sms_token);
    if (!isMatched) {
      throw new ForbiddenException('Otp expired! try again');
    }

    const { phone_id } = this.jwtService.decode(payload.sms_token);

    const code = await this.verificationCode.findOneBy({ id: phone_id });

    if (!code) {
      throw new NotFoundException('Something went wrong! try again');
    }

    if (code.otp !== payload.otp) {
      throw new ForbiddenException('Otp did not matched! try again');
    }

    const jwtPayload = {
      code_id: code.id,
      phone: code.phone,
    };

    const verified_token = await this.jwtService.signAsync(jwtPayload);

    return {
      verified_token,
    };
  }

  async reactToLocation(
    user,
    locationId: string,
    reaction: ReactionType,
  ): Promise<{ like_count: number; dislike_count: number }> {
    return this.dataSource.transaction(async (manager) => {
      const locationRepo = manager.getRepository(Location);
      const reactionRepo = manager.getRepository(LocationReaction);

      const location = await locationRepo.findOne({ where: { id: locationId } });
      if (!location) throw new NotFoundException('Location not found');

      let existingReaction = await reactionRepo.findOne({
        where: { user: { id: user.id }, location: { id: locationId } },
        relations: ['user', 'location'],
      });

      if (!existingReaction) {
        existingReaction = reactionRepo.create({
          user,
          location,
          reactionType: reaction,
        });
        await reactionRepo.save(existingReaction);

        if (reaction === ReactionType.LIKE) location.like_count++;
        else location.dislike_count++;

      } else if (existingReaction.reactionType === reaction) {
        await reactionRepo.remove(existingReaction);

        if (reaction === ReactionType.LIKE) location.like_count--;
        else location.dislike_count--;

      } else {
        if (existingReaction.reactionType === ReactionType.LIKE) {
          location.like_count--;
          location.dislike_count++;
        } else {
          location.dislike_count--;
          location.like_count++;
        }

        existingReaction.reactionType = reaction;
        await reactionRepo.save(existingReaction);
      }

      await locationRepo.save(location);

      return { like_count: location.like_count, dislike_count: location.dislike_count };
    });
  }

  async getMyLocations(user) {
    const locationsData = await this.location.find({
      where: { user: { id: user.id } },
      relations: ["apiVerificationInfo", "doc", "images", "user"]
    });

    if (!locationsData) {
      throw new NotFoundException("You haven't create any locations!");
    }

    return locationsData;
  }

  async getLocationsInTwentyKilometer(
    latitude: number,
    longitude: number,
  ): Promise<Location[]> {
    const allLocations = await this.location.find({
      relations: ["apiVerificationInfo", "doc", "images", "user"]
    });

    const nearbyLocations = allLocations.filter((loc) => {
      if (!loc.gps_code) return false;

      try {
        const { latitude: lat2, longitude: lon2 } = this.helper.parseGpsCode(loc.gps_code);
        const distance = this.helper.haversineDistance(latitude, longitude, lat2, lon2);
        return distance <= 20;
      } catch (e) {
        return false
      }
    });

    return nearbyLocations;
  }
}

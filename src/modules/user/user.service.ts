import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly cloudinary: CloudinaryService
  ) { }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new InternalServerErrorException('Something went wrong!');
    }
    const { password, ...result } = user;

    return {
      user: result
    };
  }

  async update(user, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    const userData = await this.userRepository.findOneBy({ id: user.id });

    if (!userData) {
      throw new InternalServerErrorException('Something went wrong, try again!');
    }

    userData.name = updateUserDto.name ? updateUserDto.name : userData.name;
    userData.phone = updateUserDto.phone ? updateUserDto.phone : userData.phone;
    userData.address = updateUserDto.address ? updateUserDto.address : userData.address;

    if (file) {

      if (user.image) {
        const publicId = this.cloudinary.extractPublicId(user.image);
        await this.cloudinary.destroyFile(publicId);
      }

      const res = await this.cloudinary.uploadFile(file);
      userData.image = res['secure_url'];
    }



    const { password, ...result } = await this.userRepository.save(userData);
    return {
      user: result
    }
  }
}

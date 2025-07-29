import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtHelperModule } from 'src/config/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../user/entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { VerificaitonCode } from '../user/entities/verification-code.entity';
import { Reward } from '../reward/entities/reward.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerificaitonCode, Reward]),
    JwtHelperModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule { }

import { AbstractEntity } from 'src/common/utils/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum OtpSendMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

@Entity('verification_codes')
export class VerificaitonCode extends AbstractEntity {
  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ enum: OtpSendMethod })
  method: OtpSendMethod;

  @Column()
  otp: string;
}

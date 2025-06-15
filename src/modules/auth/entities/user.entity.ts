import { AbstractionEntity } from 'src/common/utils/abstraction.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class User extends AbstractionEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ enum: ['customer', 'provider', 'admin'], default: 'customer' })
  role?: string;

  @Column({ nullable: true })
  otp?: string;

  @Column({ nullable: true })
  avater?: string;

  @Column({ enum: ['blocked', 'active', 'inactive'], default: 'inactive' })
  status: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}

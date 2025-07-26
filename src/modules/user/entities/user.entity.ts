import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/common/utils/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  image: string;

  @Column({ enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true })
  address: string;
}

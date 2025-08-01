import { AbstractEntity } from 'src/common/utils/abstract.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { Location } from './location.entity';

@Entity('location_images')
export class LocationImage extends AbstractEntity {
  @Column({ nullable: true })
  selfie: string;

  @Column('text', { nullable: true, array: true })
  images: Array<string>;
}

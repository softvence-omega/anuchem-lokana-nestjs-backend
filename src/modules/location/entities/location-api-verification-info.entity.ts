import { AbstractEntity } from 'src/common/utils/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity('location_api_verification_infos')
export class LocationApiVerificationInfo extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  date_of_birth: string;

  @Column()
  national_id: string;

  @Column()
  country: string;
}

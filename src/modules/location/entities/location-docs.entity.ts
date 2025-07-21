import { AbstractEntity } from 'src/common/utils/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity('location_docs')
export class LocationDocs extends AbstractEntity {
  @Column()
  doc: string;

  @Column()
  doc_type: string;
}

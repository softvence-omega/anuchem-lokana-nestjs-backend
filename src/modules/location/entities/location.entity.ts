import { AbstractionEntity } from "src/common/utils/abstraction.entity";
import { Column, Entity, OneToOne } from "typeorm";

@Entity('locations')
export class Location extends AbstractionEntity {
    @Column()
    gps_code: string;

    @Column()
    street_name: string;

    @Column()
    district: string;

    @Column()
    region: string;

}

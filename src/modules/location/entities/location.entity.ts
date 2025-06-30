import { AbstractEntity } from "src/common/utils/abstract.entity";
import { Column, Entity, OneToOne } from "typeorm";

export enum Status {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}

@Entity('locations')
export class Location extends AbstractEntity {
    @Column()
    gps_code: string;

    @Column()
    street_name: string;

    @Column()
    district: string;

    @Column()
    region: string;

    @Column({ enum: Status })
    status: Status
}

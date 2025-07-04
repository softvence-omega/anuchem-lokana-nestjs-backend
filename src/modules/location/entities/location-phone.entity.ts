import { AbstractEntity } from "src/common/utils/abstract.entity";
import { Column, Entity } from "typeorm";

@Entity('location_phones')
export class LocationPhone extends AbstractEntity {
    @Column()
    country_code: string;

    @Column()
    phone: string;

    @Column()
    is_verified: string;

    @Column()
    otp: string;
}
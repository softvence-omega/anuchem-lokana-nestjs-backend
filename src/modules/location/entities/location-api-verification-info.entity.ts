import { Column, Entity, OneToOne } from "typeorm";
import { LocationDocs } from "./location-docs.entity";
import { Location } from "./location.entity";

@Entity('location_api_verification_infos')
export class LocationApiVerificationInfo {
    @Column()
    name: string;

    @Column()
    date_of_birth: string;

    @Column()
    national_id: string;

    @Column()
    country: string;

    @OneToOne(() => LocationDocs, { cascade: true, onDelete: 'CASCADE' })
    location_doc: LocationDocs;

    @OneToOne(() => Location, { cascade: true, onDelete: 'CASCADE' })
    location: Location
}
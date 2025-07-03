import { AbstractEntity } from "src/common/utils/abstract.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { Location } from "./location.entity";

@Entity("location_docs")
export class LocationDocs extends AbstractEntity {
    @Column()
    doc: string;

    @Column()
    doc_type: string;

    @OneToOne(() => Location, { cascade: true, onDelete: 'CASCADE' })
    location: Location
}
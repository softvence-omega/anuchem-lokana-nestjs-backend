import { AbstractEntity } from 'src/common/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { LocationDocs } from './location-docs.entity';
import { LocationApiVerificationInfo } from './location-api-verification-info.entity';
import { LocationImage } from './location-selfie.entity';
import { User } from 'src/modules/user/entities/user.entity';

export enum Status {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

@Entity('locations')
export class Location extends AbstractEntity {
    @ManyToOne(() => User, { eager: false })
    @JoinColumn()
    user: User;

    @Column({ unique: true })
    gps_code: string;

    @Column({ nullable: true })
    street_name: string;

    @Column({ nullable: true })
    district: string;

    @Column({ nullable: true })
    region: string;

    @Column({ enum: Status, default: Status.PENDING })
    status: Status;

    @Column({ nullable: true })
    agent_code: string;

    @OneToOne(() => LocationDocs, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    doc: LocationDocs;

    @Column({ nullable: true })
    phone: string;

    @OneToOne(() => LocationImage, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    images: LocationImage;

    @OneToOne(() => LocationApiVerificationInfo, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    apiVerificationInfo: LocationApiVerificationInfo;

    @Column({ default: 0 })
    like_count: number;

    @Column({ default: 0 })
    dislike_count: number;

    @Column({ nullable: true })
    description: string;
}

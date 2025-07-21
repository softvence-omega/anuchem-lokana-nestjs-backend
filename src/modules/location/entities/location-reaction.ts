import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, Unique, JoinColumn } from 'typeorm';
import { Location } from './location.entity';
import { User } from 'src/modules/user/entities/user.entity';

export enum ReactionType {
    LIKE = 'like',
    DISLIKE = 'dislike',
}

@Entity('location_reactions')
@Unique(['user', 'location']) // one reaction per user per location
export class LocationReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @ManyToOne(() => Location, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn()
    location: Location;

    @Column({ type: 'enum', enum: ReactionType })
    reactionType: ReactionType;
}

import { AbstractEntity } from "src/common/utils/abstract.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('reward_histories')
export class RewardHistory extends AbstractEntity {
    @ManyToOne(() => User, { cascade: true })
    @JoinColumn()
    user: User;

    @Column({ nullable: true })
    reason: string;

    @Column({ type: 'int4', default: 0 })
    reward_points: number;
}
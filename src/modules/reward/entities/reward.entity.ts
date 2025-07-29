import { AbstractEntity } from "src/common/utils/abstract.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity('reward')
export class Reward extends AbstractEntity {
    @OneToOne(() => User, { cascade: true })
    @JoinColumn()
    user: User;

    @Column({ type: 'int4', default: 0 })
    user_points: number;

    @Column({ type: 'int4', default: 0 })
    redeem_points: number;

    @Column({ type: 'int4', default: 0 })
    last_redeem_amount: number;

    @Column({ type: 'int4', default: 0 })
    total_redeem_amount: number;
}
import { AbstractEntity } from "src/common/utils/abstract.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";

@Entity()
export class RewardOption extends AbstractEntity {
    @Column()
    name: string;

    @Column()
    points: number;

    @Column()
    reward_amounts: number

    // @ManyToOne(() => User)
    // created_by: User
}
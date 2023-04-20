import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity"

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
	  eager: true
  })
  user1: User;

  @ManyToOne(() => User, {
	  eager: true
  })
  user2: User;

  @Column({nullable: true})
  winner: number;

  @Column({nullable: true})
  loser: number;

  @Column("int", { array: true })
  score: number[];
}

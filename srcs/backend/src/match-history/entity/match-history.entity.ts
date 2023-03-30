import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  @Column({nullable: true})
  winner: number;

  @Column({nullable: true})
  loser: number;

  @Column("int", { array: true })
  score: number[];
}

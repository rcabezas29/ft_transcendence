import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  @Column()
  winner: number;

  @Column("int", { array: true })
  score: number[];
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum FriendshipStatus {
  Pending,
  Active,
  Block,
}

@Entity()
export class Friends {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  @Column({ default: 0 })
  status: FriendshipStatus;
}

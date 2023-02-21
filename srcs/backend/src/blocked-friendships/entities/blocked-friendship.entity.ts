import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlockedFriendship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  blockedUserId: number;

  @Column()
  friendshipId: number;
}

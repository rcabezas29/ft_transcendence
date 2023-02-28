import { Friendship } from 'src/friendships/entities/friendship.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlockedFriendship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  blockedUserId: number;

  @OneToOne(() => Friendship, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  friendship: Friendship;
}

import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Stats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  wonGames: number;

  @Column({ default: 0 })
  lostGames: number;

  @Column({ default: 0 })
  scoredGoals: number;

  @Column({ default: 0 })
  receivedGoals: number;

  @OneToOne(() => User, (user) => user.stats, {
     onDelete: 'CASCADE'
  })
  @JoinColumn()
  user: User;
}

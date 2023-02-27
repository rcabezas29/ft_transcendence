import { Stats } from 'src/stats/entity/stats.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  readonly email: string;

  @Column({ default: 'default_avatar.png' })
  avatar: string;

  @Column()
  readonly password: string;

  @Column({ default: 1000 })
  elo: number;

  @JoinColumn()
  @OneToOne(() => Stats, (stats) => stats.user, {
    onDelete: 'CASCADE',
  })
  stats: Stats;
}

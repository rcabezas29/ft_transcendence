import { Stats } from 'src/stats/entities/stats.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
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

  @Column({ nullable: true })
  public twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;

  @OneToOne(() => Stats, (stats) => stats.user, {
    cascade: true,
    eager: true
  })
  stats: Stats;
}

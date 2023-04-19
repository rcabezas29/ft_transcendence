import { Exclude } from 'class-transformer';
import { Stats } from 'src/stats/entities/stats.entity';
import { UserRole } from '../interfaces/user-roles';
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

  @Column({ nullable: true })
  intraUsername: string;

  @Column()
  readonly email: string;

  @Column({ default: 'default_avatar.jpg' })
  avatar: string;

  @Column()
  @Exclude()
  readonly password: string;

  @Column({ default: 1000 })
  elo: number;

  @Column({ nullable: true })
  @Exclude()
  twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @OneToOne(() => Stats, (stats) => stats.user, {
    cascade: true,
    eager: true
  })
  stats: Stats;

  @Column({ default: UserRole.USER })
  role: UserRole;
}

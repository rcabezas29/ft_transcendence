import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  readonly email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  readonly password: string;
}

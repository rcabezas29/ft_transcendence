import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Stats } from './entity/stats.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stats) private statsRepository: Repository<Stats>,
  ) {}

  create(user: User) {
    return this.statsRepository.save({ user: user });
  }

  update(id: number) {

  }
}

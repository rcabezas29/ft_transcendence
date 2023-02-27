import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stats } from './entity/stats.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stats) private statsRepository: Repository<Stats>,
  ) {}

  update(id: number) {

  }
}

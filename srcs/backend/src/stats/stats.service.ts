import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStatsDto } from './dto/update-stats.dto';
import { Stats } from './entities/stats.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stats) private statsRepository: Repository<Stats>,
  ) {}

  async update(id: number, updateStats: UpdateStatsDto) {
    const statToUpdate = {
      id,
      ...updateStats,
    };
    try {
      const stat = await this.statsRepository.preload(statToUpdate);
      if (stat) {
        const res = await this.statsRepository.save(stat);
        return res;
      }
    } catch (e) {
      throw new BadRequestException('Failed to update stats');
    }
    throw new NotFoundException();
  }
}

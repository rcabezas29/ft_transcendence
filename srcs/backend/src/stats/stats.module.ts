import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stats } from './entity/stats.entity';

@Module({
  providers: [StatsService],
  imports: [TypeOrmModule.forFeature([Stats])],
  exports: [StatsService, TypeOrmModule]
})
export class StatsModule {}

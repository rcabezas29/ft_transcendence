import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchHistory } from './entity/match-history.entity';
import { MatchHistoryService } from './match-history.service';

@Module({
  providers: [MatchHistoryService],
  imports: [
    TypeOrmModule.forFeature([MatchHistory]),
  ],
  exports: [MatchHistoryService, TypeOrmModule],
})
export class MatchHistoryModule {}

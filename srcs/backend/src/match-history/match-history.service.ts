import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateMatchHistoryDto } from './dto/create-match-history.dto';
import { MatchHistory } from './entity/match-history.entity';

@Injectable()
export class MatchHistoryService {
    constructor(
        @InjectRepository(MatchHistory) private matchHistoryRepository: Repository<MatchHistory>
    ) {}

    async create(createMatchHistory: CreateMatchHistoryDto) {
        try {
            const hist = await this.matchHistoryRepository.save(createMatchHistory);
            return hist;
          } catch (e) {
            throw new BadRequestException('Failed to create match historic');
        }
    }

    async findByUser(userId: number): Promise<MatchHistory[]> {
		return await this.matchHistoryRepository.find({
            where: [
                { user1Id: userId },
                { user2Id: userId },
            ]
        });
    }
}

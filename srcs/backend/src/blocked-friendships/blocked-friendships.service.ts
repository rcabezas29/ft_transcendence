import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from 'src/friendships/entities/friendship.entity';
import { Repository } from 'typeorm';
import { CreateBlockedFriendshipDto } from './dto/create-blocked-friendship.dto';
import { BlockedFriendship } from './entities/blocked-friendship.entity';

export enum BlockDirection {
    Blocker = 0,
    Blocked = 1
}

@Injectable()
export class BlockedFriendshipsService {
    constructor(
        @InjectRepository(BlockedFriendship)
        private blockedFriendshipsRepository: Repository<BlockedFriendship>
    ) {}

    async create(createBlockedFriendshipDto: CreateBlockedFriendshipDto, friendship: Friendship) {
        const userId = createBlockedFriendshipDto.userId;
        const blockedUserId = createBlockedFriendshipDto.blockedUserId;

        if (userId === blockedUserId)
            return;

        const blockExists = await this.findByFriendshipUsers(userId, blockedUserId);
        const inverseBlockExists = await this.findByFriendshipUsers(blockedUserId, userId);
        if (blockExists || inverseBlockExists)
            return;

        const newBlock = {...createBlockedFriendshipDto, friendship};
        return await this.blockedFriendshipsRepository.save(newBlock);
    }

    async removeByFriendshipId(friendshipId: number) {
        const block: BlockedFriendship = await this.findByFriendshipId(friendshipId);
        if (!block)
            return;
        return this.blockedFriendshipsRepository.delete(block.id);
    }

    findByFriendshipId(friendshipId: number) {
        return this.blockedFriendshipsRepository.findOneBy({ friendship: {id: friendshipId} });
    }

    async findByFriendshipUsers(userId: number, blockedUserId: number) {
        const block: BlockedFriendship = await this.blockedFriendshipsRepository
                    .findOneBy({ userId, blockedUserId });
        return block;
    }

    async checkBlockDirection(userId: number, friendshipId: number): Promise<BlockDirection> {
        const block: BlockedFriendship = await this.findByFriendshipId(friendshipId);
        if (!block)
            return null;

        if (userId === block.userId)
            return BlockDirection.Blocker;
        else if (userId === block.blockedUserId)
            return BlockDirection.Blocked;

        return null;
    }

}

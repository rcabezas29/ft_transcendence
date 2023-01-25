import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friends } from './entities/friend.entity';

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(Friends)
        private friendsRepository: Repository<Friends>,
    ) { }

    async create(createFriendsDto: CreateFriendDto) {
        return await this.friendsRepository.save(createFriendsDto);
    }

    findAll() {
        return this.friendsRepository.find();
    }

    findOne(id: number) {
        return this.friendsRepository.findOneBy({ id: id });
    }

    async update(id: number, updateFriendDto: UpdateFriendDto) {
        const friendsToUpdate = {
            id,
            ...updateFriendDto,
        };
        try {
            const friends = await this.friendsRepository.preload(friendsToUpdate);
            if (friends) {
                const res = await this.friendsRepository.save(friends);
                return res;
            }
        } catch (e) {
            throw new BadRequestException();
        }
        throw new NotFoundException();
    }

    remove(id: number) {
        this.friendsRepository.delete(id);
    }

    findUserFriends(id: number, status: number) {
        return this.friendsRepository.find({
            where: [
                { user1Id: id, status: status },
                { user2Id: id, status: status },
            ]
        });
    }

}

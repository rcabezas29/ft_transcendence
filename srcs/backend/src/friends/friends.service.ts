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
        if (await this.usersAreFriends(createFriendsDto.user1Id, createFriendsDto.user2Id))
            throw new BadRequestException('Users are already friends');
        return await this.friendsRepository.save(createFriendsDto);
    }

    findAll() {
        return this.friendsRepository.find();
    }

    findOne(id: number) {
        return this.friendsRepository.findOneBy({ id: id });
    }

    async findByFriendshipUsers(user1Id: number, user2Id: number) {
        const friendship: Friends[] = await this.friendsRepository.find({
            where: [
                { user1Id: user1Id, user2Id: user2Id },
                { user1Id: user2Id, user2Id: user1Id }
            ]
        });
        if (friendship.length > 0)
            return friendship[0];
        return null;
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

    async usersAreFriends(user1Id: number, user2Id: number): Promise<boolean> {
        const friendship: Friends = await this.findByFriendshipUsers(user1Id, user2Id);
        if (!friendship)
            return false;
        return true;
    }

    findUserFriends(userId: number, status: number): Promise<Friends[]> {
        return this.friendsRepository.find({
            where: [
                { user1Id: userId, status: status },
                { user2Id: userId, status: status },
            ]
        });
    }
}

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { Friendship } from './entities/friendship.entity';

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(Friendship)
        private friendshipsRepository: Repository<Friendship>,
    ) { }

    async create(createFriendshipDto: CreateFriendshipDto) {
        if (createFriendshipDto.user1Id === createFriendshipDto.user2Id)
            throw new BadRequestException('Users cannot friend themselves');

        if (await this.usersAreFriends(createFriendshipDto.user1Id, createFriendshipDto.user2Id))
            throw new BadRequestException('Users are already friends');
        
        return await this.friendshipsRepository.save(createFriendshipDto);
    }

    findAll() {
        return this.friendshipsRepository.find();
    }

    findOne(id: number) {
        return this.friendshipsRepository.findOneBy({ id: id });
    }

    async update(id: number, updateFriendshipDto: UpdateFriendshipDto) {
        const friendsToUpdate = {
            id,
            ...updateFriendshipDto,
        };
        try {
            const friendships = await this.friendshipsRepository.preload(friendsToUpdate);
            if (friendships) {
                const res = await this.friendshipsRepository.save(friendships);
                return res;
            }
        } catch (e) {
            throw new BadRequestException();
        }
        throw new NotFoundException();
    }

    remove(id: number) {
        this.friendshipsRepository.delete(id);
    }

    async usersAreFriends(user1Id: number, user2Id: number): Promise<boolean> {
        const friendship: Friendship = await this.findByFriendshipUsers(user1Id, user2Id);
        if (!friendship)
            return false;
        return true;
    }

    findUserFriendshipsByStatus(userId: number, status: number): Promise<Friendship[]> {
        return this.friendshipsRepository.find({
            where: [
                { user1Id: userId, status: status },
                { user2Id: userId, status: status },
            ]
        });
    }

    findAllUserFriendships(userId: number): Promise<Friendship[]> {
        return this.friendshipsRepository.find({
            where: [
                { user1Id: userId },
                { user2Id: userId },
            ]
        });
    }

    async findByFriendshipUsers(user1Id: number, user2Id: number) {
        const friendship: Friendship[] = await this.friendshipsRepository.find({
            where: [
                { user1Id: user1Id, user2Id: user2Id },
                { user1Id: user2Id, user2Id: user1Id }
            ]
        });
        if (friendship.length > 0)
            return friendship[0];
        return null;
    }
}

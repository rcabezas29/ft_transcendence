import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendshipDto } from 'src/friendships/dto/create-friendship.dto';
import { UpdateFriendshipDto } from 'src/friendships/dto/update-friendship.dto';
import { Friendship } from 'src/friendships/entities/friendship.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendshipsService {
    constructor(
        @InjectRepository(Friendship)
        private friendshipsRepository: Repository<Friendship>,
    ) {}

    create(createFriendshipDto: CreateFriendshipDto) {
        return this.friendshipsRepository.save(createFriendshipDto);
    }

    async update(id: number, updateFriendshipDto: UpdateFriendshipDto) {
        const friendsToUpdate = {
            id,
            ...updateFriendshipDto,
        };
        try {
            const friendship = await this.friendshipsRepository.preload(friendsToUpdate);
            if (friendship) {
                const res = await this.friendshipsRepository.save(friendship);
                return res;
            }
        } catch (e) {
            throw new BadRequestException();
        }
        throw new NotFoundException();
    }

    async remove(id: number) {
        const friendship: Friendship = await this.findOneById(id);
        if (!friendship)
            throw new NotFoundException();
        this.friendshipsRepository.delete(id);
    }

    findAll() {
        return this.friendshipsRepository.find();
    }

    findOneById(id: number) {
        return this.friendshipsRepository.findOneBy({ id: id });
    }

/*    async findUserFriendsIdsByStatus(userId: number, status: FriendshipStatus): Promise<number[]> {
        const friendsRelations: Friendship[] = await this.findUserFriendshipsByStatus(userId, status);
        const friendsIds: number[] = friendsRelations.map((friend) => {
            if (friend.user1Id == userId)
                return friend.user2Id;
            else
                return friend.user1Id;
        });
        return friendsIds;
    }

    findUserFriendshipsByStatus(userId: number, status: number): Promise<Friendship[]> {
        return this.friendshipsRepository.find({
            where: [
                { user1Id: userId, status: status },
                { user2Id: userId, status: status },
            ]
        });
    }
*/
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

    async usersAreFriends(user1Id: number, user2Id: number): Promise<boolean> {
        const friendship: Friendship = await this.findByFriendshipUsers(user1Id, user2Id);
        if (!friendship)
            return false;
        return true;
    }
}

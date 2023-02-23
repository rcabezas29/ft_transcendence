import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendshipDto } from 'src/friends/dto/create-friendship.dto';
import { UpdateFriendshipDto } from 'src/friends/dto/update-friendship.dto';
import { Friendship, FriendshipStatus } from 'src/friends/entities/friendship.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserFriendshipsService {
    constructor(
        @InjectRepository(Friendship)
        private friendshipsRepository: Repository<Friendship>,
    ) {}

    async create(createFriendshipDto: CreateFriendshipDto, user1: User, user2: User, requestUser) {
        if (!user1 || !user2)
            throw new BadRequestException('One or more of the friendship users do not exist');

        if (user1.id != requestUser.id && user2.id != requestUser.id)
            throw new UnauthorizedException('Users can only create friendships for themselves');

        if (user1.id === user2.id)
            throw new BadRequestException('Users cannot friend themselves');

        if (await this.usersAreFriends(user1.id, user2.id))
            throw new BadRequestException('Users are already friends');

        const newFriendship = await this.friendshipsRepository.save(createFriendshipDto);

        return newFriendship;
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

    async findUserFriendsIdsByStatus(userId: number, status: FriendshipStatus): Promise<number[]> {
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

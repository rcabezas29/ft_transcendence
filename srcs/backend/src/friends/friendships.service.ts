import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { Friendship, FriendshipStatus } from './entities/friendship.entity';

export enum FriendRequestDirection {
    Sender = 0,
    Receiver = 1
}

@Injectable()
export class FriendshipsService {
    constructor(
        @InjectRepository(Friendship)
        private friendshipsRepository: Repository<Friendship>,

        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService
    ) { }

    async create(createFriendshipDto: CreateFriendshipDto, requestUser) {
        if (!await this.usersService.findOneById(createFriendshipDto.user1Id)
            || !await this.usersService.findOneById(createFriendshipDto.user2Id))
            throw new BadRequestException('One or more of the friendship users do not exist');

        if (createFriendshipDto.user1Id != requestUser.id && createFriendshipDto.user2Id != requestUser.id)
            throw new UnauthorizedException('Users can only create friendships for themselves');

        if (createFriendshipDto.user1Id === createFriendshipDto.user2Id)
            throw new BadRequestException('Users cannot friend themselves');

        if (await this.usersAreFriends(createFriendshipDto.user1Id, createFriendshipDto.user2Id))
            throw new BadRequestException('Users are already friends');
        
        return await this.friendshipsRepository.save(createFriendshipDto);
    }

    findAll() {
        return this.friendshipsRepository.find();
    }

    findOneById(id: number) {
        return this.friendshipsRepository.findOneBy({ id: id });
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

    async handleFriendRequest(id: number, requestUser, action: string) {
        const friendship: Friendship = await this.findOneById(id);
        if (!friendship)
            throw new NotFoundException();

        if (friendship.status != FriendshipStatus.Pending)
            throw new BadRequestException('Friendship is not pending');

        const friendReqDirection: FriendRequestDirection = await this.checkFriendRequestDirection(requestUser.id, id);
        if (friendReqDirection === FriendRequestDirection.Sender)
            throw new BadRequestException('User cannot handle their own friend request');
        else if (friendReqDirection === FriendRequestDirection.Receiver) {
            if (action === 'accept')
                return this.update(id, { status: FriendshipStatus.Active });
            else if (action === 'deny')
                return this.remove(id);
        }

        throw new BadRequestException();
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

    async getFriendRequestDirection(id: number, requestUser) {
        const friendReqDirection: FriendRequestDirection = await this.checkFriendRequestDirection(requestUser.id, id);
        return friendReqDirection;
    }

    private async checkFriendRequestDirection(userId: number, friendshipId: number): Promise<FriendRequestDirection> {
        const friendship: Friendship = await this.findOneById(friendshipId);
        if (!friendship)
            return null;

        if (userId === friendship.user1Id)
            return FriendRequestDirection.Sender;
        else if (userId === friendship.user2Id)
            return FriendRequestDirection.Receiver;
        return null;
    }
}

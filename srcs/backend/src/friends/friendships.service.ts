import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockDirection, BlockedFriendshipsService } from 'src/blocked-friendships/blocked-friendships.service';
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
        private usersService: UsersService,

        private blockedFriendshipsService: BlockedFriendshipsService
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

        const newFriendship = await this.friendshipsRepository.save(createFriendshipDto);

        if (createFriendshipDto.status === FriendshipStatus.Blocked)
            this.createBlockedFriendship(requestUser.id, newFriendship.user1Id, newFriendship.user2Id, newFriendship.id);
        
        return newFriendship;
    }

    findAll() {
        return this.friendshipsRepository.find();
    }

    findOneById(id: number) {
        return this.friendshipsRepository.findOneBy({ id: id });
    }

    async update(id: number, updateFriendshipDto: UpdateFriendshipDto, userId: number) {
        const friendsToUpdate = {
            id,
            ...updateFriendshipDto,
        };
        try {
            const friendship = await this.friendshipsRepository.preload(friendsToUpdate);
            if (friendship) {
                const res = await this.friendshipsRepository.save(friendship);
                if (res.status === FriendshipStatus.Blocked)
                    this.createBlockedFriendship(userId, res.user1Id, res.user2Id, id);
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
                return this.update(id, { status: FriendshipStatus.Active }, requestUser.id);
            else if (action === 'deny')
                return this.remove(id);
        }

        throw new BadRequestException();
    }

    remove(id: number) {
        this.friendshipsRepository.delete(id);
        this.blockedFriendshipsService.removeByFriendshipId(id);
    }

    async blockFriend(id: number, requestUser) {
        return this.update(id, { status: FriendshipStatus.Blocked }, requestUser.id);
    }

    async unblockFriend(id: number, requestUser) {
        this.blockedFriendshipsService.removeByFriendshipId(id);
        return this.update(id, { status: FriendshipStatus.Active }, requestUser.id);
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
        if (friendReqDirection === null)
            throw new BadRequestException('Friendship does not exist or is not a friend request');
        return friendReqDirection;
    }

    async getBlockDirection(id: number, requestUser) {
        const blockDirection: BlockDirection = await this.blockedFriendshipsService.checkBlockDirection(requestUser.id, id);
        if (blockDirection === null)
            throw new BadRequestException('Friendship does not exist or is not blocked');
        return blockDirection;
    }

    private async checkFriendRequestDirection(userId: number, friendshipId: number): Promise<FriendRequestDirection> {
        const friendship: Friendship = await this.findOneById(friendshipId);
        if (!friendship)
            return null;
        if (friendship.status !== FriendshipStatus.Pending)
            return null;

        if (userId === friendship.user1Id)
            return FriendRequestDirection.Sender;
        else if (userId === friendship.user2Id)
            return FriendRequestDirection.Receiver;
        return null;
    }

    private createBlockedFriendship(userId: number, newUser1Id: number, newUser2Id: number, friendshipId: number) {
        return this.blockedFriendshipsService.create({
            userId: userId == newUser1Id ? newUser1Id : newUser2Id,
            blockedUserId: userId == newUser1Id ? newUser2Id : newUser1Id,
            friendshipId: friendshipId
        });
    }
}

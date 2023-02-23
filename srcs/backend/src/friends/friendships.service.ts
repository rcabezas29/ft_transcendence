import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { BlockDirection, BlockedFriendshipsService } from 'src/blocked-friendships/blocked-friendships.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { UserFriendshipsService } from 'src/user-friendships/user-friendships.service';
import { User } from 'src/users/entities/user.entity';
import { UserFriend } from 'src/users/interfaces/user-friend.interface';
import { UsersService } from 'src/users/users.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { Friendship, FriendshipStatus } from './entities/friendship.entity';

export enum FriendRequestDirection {
    Sender = 0,
    Receiver = 1
}

interface FriendshipStatusPayload {
    status: FriendshipStatus;
    friendId: number;
}

@Injectable()
export class FriendshipsService {
    constructor(
        private blockedFriendshipsService: BlockedFriendshipsService,
        private usersService: UsersService,
        private userFriendshipsService: UserFriendshipsService,
        private gatewayManagerService: GatewayManagerService
    ) { }

    async create(createFriendshipDto: CreateFriendshipDto, requestUser) {
        const user1 = await this.usersService.findOneById(createFriendshipDto.user1Id);
        const user2 = await this.usersService.findOneById(createFriendshipDto.user2Id);

        const newFriendship = await this.userFriendshipsService.create(createFriendshipDto, user1, user2, requestUser);
        if (newFriendship.status === FriendshipStatus.Blocked)
            this.createBlockedFriendship(requestUser.id, newFriendship.user1Id, newFriendship.user2Id, newFriendship.id);

        await this.notifyUsersOfNewFriendship(user1.id, user2.id, newFriendship.id, newFriendship.status);

        return newFriendship;
    }

    async update(id: number, updateFriendshipDto: UpdateFriendshipDto, userId: number) {
        const res = await this.userFriendshipsService.update(id, updateFriendshipDto);

        if (res.status === FriendshipStatus.Blocked)
            this.createBlockedFriendship(userId, res.user1Id, res.user2Id, id);
        
        this.notifyUsersOfChangeInFriendshipStatus(res.user1Id, res.user2Id, res.status);
    }

    async remove(id: number) {
        const friendship: Friendship = await this.userFriendshipsService.findOneById(id);
        if (!friendship)
            throw new NotFoundException();

        this.userFriendshipsService.remove(id);
        this.blockedFriendshipsService.removeByFriendshipId(id);
        this.notifyUsersOfDeletedFriendship(friendship.user1Id, friendship.user2Id);
    }

    async handleFriendRequest(id: number, requestUser, action: string) {
        const friendship: Friendship = await this.userFriendshipsService.findOneById(id);
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

    async blockFriend(id: number, requestUser) {
        return this.update(id, { status: FriendshipStatus.Blocked }, requestUser.id);
    }

    async unblockFriend(id: number, requestUser) {
        this.blockedFriendshipsService.removeByFriendshipId(id);
        return this.update(id, { status: FriendshipStatus.Active }, requestUser.id);
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
        const friendship: Friendship = await this.userFriendshipsService.findOneById(friendshipId);
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

    private async notifyUsersOfNewFriendship(user1Id: number, user2Id: number, friendshipId: number, friendshipStatus: FriendshipStatus) {
        const user1: User = await this.usersService.findOneById(user1Id);
        const user2: User = await this.usersService.findOneById(user2Id);
        
        const gatewayUser1: GatewayUser = this.gatewayManagerService.getClientByUserId(user1Id);
        const gatewayUser2: GatewayUser = this.gatewayManagerService.getClientByUserId(user2Id);

        const user1Payload: UserFriend = {
            userId: user2.id,
            username: user2.username,
            friendshipId: friendshipId,
            friendshipStatus: friendshipStatus
        };
        const user2Payload: UserFriend = {
            userId: user1.id,
            username: user1.username,
            friendshipId: friendshipId,
            friendshipStatus: friendshipStatus
        };
        if (gatewayUser1)
            gatewayUser1.socket.emit('new-friendship', user1Payload);
        if (gatewayUser2)
            gatewayUser2.socket.emit('new-friendship', user2Payload);

        if (gatewayUser1 && gatewayUser2) {
            gatewayUser2.socket.emit('friend-online', gatewayUser1.id);
            gatewayUser1.socket.emit('friend-online', gatewayUser2.id);
        }
    }

    private notifyUsersOfChangeInFriendshipStatus(user1Id: number, user2Id: number, friendshipStatus: FriendshipStatus) {
        const gatewayUser1: GatewayUser = this.gatewayManagerService.getClientByUserId(user1Id);
        const gatewayUser2: GatewayUser = this.gatewayManagerService.getClientByUserId(user2Id);

        const user1Payload: FriendshipStatusPayload = {
            friendId: user2Id,
            status: friendshipStatus
        };
        const user2Payload: FriendshipStatusPayload = {
            friendId: user1Id,
            status: friendshipStatus
        };
        
        if (gatewayUser1)
            gatewayUser1.socket.emit('friendship-status-change', user1Payload);
        if (gatewayUser2)
            gatewayUser2.socket.emit('friendship-status-change', user2Payload);
    }

    private notifyUsersOfDeletedFriendship(user1Id: number, user2Id: number) {
        const gatewayUser1: GatewayUser = this.gatewayManagerService.getClientByUserId(user1Id);
        const gatewayUser2: GatewayUser = this.gatewayManagerService.getClientByUserId(user2Id);

        if (gatewayUser1)
            gatewayUser1.socket.emit('friendship-deleted', user2Id);
        if (gatewayUser2)
            gatewayUser2.socket.emit('friendship-deleted', user1Id);
    }
}

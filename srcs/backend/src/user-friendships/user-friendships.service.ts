import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { BlockDirection, BlockedFriendshipsService } from 'src/blocked-friendships/blocked-friendships.service';
import { CreateBlockedFriendshipDto } from 'src/blocked-friendships/dto/create-blocked-friendship.dto';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { User } from 'src/users/entities/user.entity';
import { UserFriend } from 'src/users/interfaces/user-friend.interface';
import { UsersService } from 'src/users/users.service';
import { CreateFriendshipDto } from '../friendships/dto/create-friendship.dto';
import { UpdateFriendshipDto } from '../friendships/dto/update-friendship.dto';
import { Friendship, FriendshipStatus } from '../friendships/entities/friendship.entity';

export enum FriendRequestDirection {
    Sender = 0,
    Receiver = 1
}

interface FriendshipStatusPayload {
    status: FriendshipStatus;
    friendId: number;
}

@Injectable()
export class UserFriendshipsService {
    constructor(
        private usersService: UsersService,
        private friendshipsService: FriendshipsService,
        private blockedFriendshipsService: BlockedFriendshipsService,
        private gatewayManagerService: GatewayManagerService
    ) { }

    async createFriendship(createFriendshipDto: CreateFriendshipDto, requestUser) {
        const user1 = await this.usersService.findOneById(createFriendshipDto.user1Id);
        const user2 = await this.usersService.findOneById(createFriendshipDto.user2Id);

        if (!user1 || !user2)
            throw new BadRequestException('One or more of the friendship users do not exist');

        if (user1.id != requestUser.id && user2.id != requestUser.id)
            throw new UnauthorizedException('Users can only create friendships for themselves');

        if (user1.id === user2.id)
            throw new BadRequestException('Users cannot friend themselves');

        if (await this.friendshipsService.usersAreFriends(user1.id, user2.id))
            throw new BadRequestException('Users are already friends');

        const newFriendship = await this.friendshipsService.create(createFriendshipDto);
        if (newFriendship.status === FriendshipStatus.Blocked)
            await this.createBlockedFriendship(requestUser.id, newFriendship.user1Id, newFriendship.user2Id, newFriendship.id);

        await this.notifyUsersOfNewFriendship(user1.id, user2.id, newFriendship.id, newFriendship.status);

        return newFriendship;
    }

    async updateFriendship(friendshipId: number, updateFriendshipDto: UpdateFriendshipDto, userId: number) {
        const res = await this.friendshipsService.update(friendshipId, updateFriendshipDto);

        if (res.status === FriendshipStatus.Blocked)
            await this.createBlockedFriendship(userId, res.user1Id, res.user2Id, friendshipId);

        this.notifyUsersOfChangeInFriendshipStatus(res.user1Id, res.user2Id, res.status);
    }

    async removeFriendship(friendshipId: number) {
        const friendship: Friendship = await this.friendshipsService.findOneById(friendshipId);
        if (!friendship)
            throw new NotFoundException();

        this.friendshipsService.remove(friendshipId);
        this.notifyUsersOfDeletedFriendship(friendship.user1Id, friendship.user2Id);
    }

    async handleFriendRequest(friendshipId: number, requestUser, action: string) {
        const friendship: Friendship = await this.friendshipsService.findOneById(friendshipId);
        if (!friendship)
            throw new NotFoundException();

        if (friendship.status != FriendshipStatus.Pending)
            throw new BadRequestException('Friendship is not pending');

        const friendReqDirection: FriendRequestDirection = await this.checkFriendRequestDirection(requestUser.id, friendshipId);
        if (friendReqDirection === FriendRequestDirection.Sender)
            throw new BadRequestException('User cannot handle their own friend request');
        else if (friendReqDirection === FriendRequestDirection.Receiver) {
            if (action === 'accept')
                return this.updateFriendship(friendshipId, { status: FriendshipStatus.Active }, requestUser.id);
            else if (action === 'deny')
                return this.removeFriendship(friendshipId);
        }

        throw new BadRequestException();
    }

    async blockFriend(friendshipId: number, requestUser) {
        return this.updateFriendship(friendshipId, { status: FriendshipStatus.Blocked }, requestUser.id);
    }

    async unblockFriend(friendshipId: number, requestUser) {
        this.blockedFriendshipsService.removeByFriendshipId(friendshipId);
        return this.updateFriendship(friendshipId, { status: FriendshipStatus.Active }, requestUser.id);
    }

    async getFriendRequestDirection(friendshipId: number, requestUser) {
        const friendReqDirection: FriendRequestDirection = await this.checkFriendRequestDirection(requestUser.id, friendshipId);
        if (friendReqDirection === null)
            throw new BadRequestException('Friendship does not exist or is not a friend request');
        return friendReqDirection;
    }

    async getBlockDirection(friendshipId: number, requestUser) {
        const blockDirection: BlockDirection = await this.blockedFriendshipsService.checkBlockDirection(requestUser.id, friendshipId);
        if (blockDirection === null)
            throw new BadRequestException('Friendship does not exist or is not blocked');
        return blockDirection;
    }

    private async checkFriendRequestDirection(userId: number, friendshipId: number): Promise<FriendRequestDirection> {
        const friendship: Friendship = await this.friendshipsService.findOneById(friendshipId);
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

    private async createBlockedFriendship(userId: number, newUser1Id: number, newUser2Id: number, friendshipId: number) {
        const newBlock: CreateBlockedFriendshipDto = {
            userId: userId == newUser1Id ? newUser1Id : newUser2Id,
            blockedUserId: userId == newUser1Id ? newUser2Id : newUser1Id,
        }
        const friendship: Friendship = await this.friendshipsService.findOneById(friendshipId);

        return this.blockedFriendshipsService.create(newBlock, friendship);
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

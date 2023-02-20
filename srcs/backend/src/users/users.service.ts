import {
    BadRequestException,
    Injectable,
    NotFoundException,
    StreamableFile,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FriendsService } from 'src/friends/friends.service';
import { Friendship } from 'src/friends/entities/friendship.entity';
import { FriendshipStatus } from 'src/friends/entities/friendship.entity';
import { IntraAuthService } from 'src/intra-auth/intra-auth.service';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FrontendFriendshipStatus, UserFriend } from './interfaces/user-friend.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private friendsService: FriendsService,
        private intraAuthService: IntraAuthService
    ) {}

    async create(createUserDto: CreateUserDto) {
        const usernameExists = await this.intraAuthService.usernameExistsInIntra(createUserDto.username);
        if (usernameExists)
            throw new BadRequestException('Username already in use. Please choose a different one.');
        
        try {
            const user = await this.usersRepository.save(createUserDto);
            const { password, ...result } = user;
            return result;
        } catch (e) {
            throw new BadRequestException('Failed to create user');
        }
    }

    async createWithoutPassword(email: string, username: string) {
        const newUser = { email, username, password: "" };
        try {
            const user = await this.usersRepository.save(newUser);
            const { password, ...result } = user;
            return result;
        } catch (e) {
            throw new BadRequestException('Failed to create user');
        }
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findAllByIds(ids: number[]): Promise<User[]> {
        return this.usersRepository.find({
            where: {
                id: In(ids)
            }
        })
    }

    findOne(id: number): Promise<User> {
        return this.usersRepository.findOneBy({ id: id });
    }

    async findOneByUsername(username: string): Promise<User> {
        return await this.usersRepository.findOneBy({ username: username });
    }

    async findOneByEmail(email: string) {
        return await this.usersRepository.findOneBy({ email: email });
    }

    async findUserFriendsByStatus(id: number, status: FriendshipStatus): Promise<User[]> {
        const friendsRelations: Friendship[] = await this.friendsService.findUserFriendshipsByStatus(id, status);
        const friendsIds: number[] = friendsRelations.map((friend) => {
            if (friend.user1Id == id)
                return friend.user2Id;
            else
                return friend.user1Id;
        });
        const friends = await this.findAllByIds(friendsIds);
        return friends;
    }

    findUserActiveFriends(id: number) {
        return this.findUserFriendsByStatus(id, FriendshipStatus.Active);
    }

    findUserFriendRequests(id: number) {
        return this.findUserFriendsByStatus(id, FriendshipStatus.Pending);
    }

    findUserBlockedFriends(id: number) {
        return this.findUserFriendsByStatus(id, FriendshipStatus.Blocked);
    }

    async getAllUserFriends(userId: number): Promise<UserFriend[]> {
        const friendsRelations: Friendship[] = await this.friendsService.findAllUserFriendships(userId);

        const allUserFriendsPromises: Promise<UserFriend>[] = friendsRelations
                .map(async (friendship: Friendship): Promise<UserFriend> => {
                    const friendId = friendship.user1Id == userId ? friendship.user2Id : friendship.user1Id;
                    const friend = await this.findOne(friendId);
                    const friendshipStatus =  this.friendshipStatusToFrontendFriendshipStatus(friendship, userId);
                    return {
                        userId: friendId,
                        username: friend.username,
                        friendshipId: friendship.id,
                        friendshipStatus: friendshipStatus
                    };
                });

        const allUserFriends: UserFriend[] = await Promise.all(allUserFriendsPromises);
        return allUserFriends;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const userToUpdate = {
            id,
            ...updateUserDto,
        };
        try {
            const user = await this.usersRepository.preload(userToUpdate);
            if (user) {
                const res = await this.usersRepository.save(user);
                return res;
            }
        } catch (e) {
            throw new BadRequestException('Failed to update user');
        }
        throw new NotFoundException();
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async getAvatar(username: string): Promise<StreamableFile> {
        const user: User = await this.findOneByUsername(username);
        if (!user)
            throw new NotFoundException("Avatar not found");
        
        const userAvatar: string = user.avatar;
        const avatars_path = join(process.cwd(), "avatars");
        const file = createReadStream(join(avatars_path, userAvatar));
        return new StreamableFile(file);
    }

    private friendshipStatusToFrontendFriendshipStatus(friendship: Friendship, userId: number): FrontendFriendshipStatus {
        const friendshipStatus: FriendshipStatus = friendship.status;
        let frontStatus: FrontendFriendshipStatus;

        if (friendshipStatus === FriendshipStatus.Pending)
            frontStatus = userId === friendship.user1Id ? FrontendFriendshipStatus.RequestSent : FrontendFriendshipStatus.RequestReceived;
        else if (friendshipStatus === FriendshipStatus.Active) 
            frontStatus = FrontendFriendshipStatus.Active;
        else if (friendshipStatus === FriendshipStatus.Blocked) 
            frontStatus = FrontendFriendshipStatus.Blocked;

        return frontStatus;
    }
}

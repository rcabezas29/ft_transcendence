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
import { createReadStream } from 'fs';
import { join } from 'path';
import { UserFriend } from './interfaces/user-friend.interface';
import { Friendship } from 'src/friendships/entities/friendship.entity';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { StatsService } from 'src/stats/stats.service';
import { Stats } from 'src/stats/entities/stats.entity';
import { GameInfo } from './interfaces/game-info.interface';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private friendshipsService: FriendshipsService,

    private statsService: StatsService,

    private filesService: FilesService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const usernameExists = await this.findOneByUsername(createUserDto.username);
    if (usernameExists) {
      throw new BadRequestException(
        'Username already in use. Please choose a different one.',
      );
    }

    const emailExists = await this.findOneByEmail(createUserDto.email);
    if (emailExists) {
      throw new BadRequestException(
        'Email address already in use. Please log in instead or choose a different one.',
      );
    }

    try {
      const newUser = { ...createUserDto, stats: new Stats() };
      const user = await this.usersRepository.save(newUser);
      const { password, ...result } = user;
      return result;
    } catch (e) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async createWithIntraUser(email: string, intraUsername: string) {
    try {
      const newUser = { email, username: '', intraUsername, password: '', stats: new Stats() };
      const user = await this.usersRepository.save(newUser);
      return user;
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
        id: In(ids),
      },
    });
  }

  findOneById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id: id });
  }

  async findOneByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOneBy({ username: username });
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email: email });
  }
  /*
    async findUserFriendsByStatus(id: number, status: FriendshipStatus): Promise<User[]> {
        const friendsIds = await this.friendshipsService.findUserFriendsIdsByStatus(id, status);
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
    */
  async getAllUserFriends(userId: number): Promise<UserFriend[]> {
    const friendsRelations: Friendship[] =
      await this.friendshipsService.findAllUserFriendships(userId);

    const allUserFriendsPromises: Promise<UserFriend>[] = friendsRelations.map(
      async (friendship: Friendship): Promise<UserFriend> => {
        const friendId =
          friendship.user1Id == userId
            ? friendship.user2Id
            : friendship.user1Id;
        const friend = await this.findOneById(friendId);
        return {
          userId: friendId,
          username: friend.username,
          friendshipId: friendship.id,
          friendshipStatus: friendship.status,
        };
      },
    );

    const allUserFriends: UserFriend[] = await Promise.all(
      allUserFriendsPromises,
    );
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

  async updateStats(id: number, gameInfo: GameInfo) {
    const user = await this.findOneById(id);

    this.statsService.update(user.stats.id, {
      wonGames: user.stats.wonGames += (gameInfo.winner ? 1 : 0),
      lostGames: user.stats.lostGames += (!gameInfo.winner ? 1 : 0),
      scoredGoals: gameInfo.scoredGoals,
      receivedGoals: gameInfo.receivedGoals,
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async getAvatar(id: number): Promise<StreamableFile> {
    const user: User = await this.findOneById(id);
    if (!user)
      throw new NotFoundException('Avatar not found');

    const userAvatar: string = user.avatar;
    const avatars_path = join(process.cwd(), 'avatars');
    const file = createReadStream(join(avatars_path, userAvatar));
    return new StreamableFile(file);
  }

  async uploadAvatar(id: number, image: Express.Multer.File) {
    const user: User = await this.findOneById(id);
    if (!user)
      throw new NotFoundException();
    
    const oldFileName = user.avatar;
    const newFileName = `${user.username}.jpg`;
    const avatarPath = join(process.cwd(), 'avatars', oldFileName)
    const newAvatarPath = join(process.cwd(), 'avatars', newFileName);

    if (avatarPath == newAvatarPath)
      this.filesService.deleteFile(avatarPath);

    this.filesService.uploadFile(newAvatarPath, image);

    if (oldFileName != newFileName) {
      const updateUserDto: UpdateUserDto = {
        avatar: this.filesService.getFileNameFromPath(newAvatarPath)
      }
      this.update(user.id, updateUserDto);
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    if (!this.findOneById(userId))
      throw new NotFoundException();

    return this.usersRepository.update(userId, {
      twoFactorAuthenticationSecret: secret
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    if (!this.findOneById(userId))
      throw new NotFoundException();

    return this.usersRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true
    });
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    if (!this.findOneById(userId))
      throw new NotFoundException();

    return this.usersRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: false
    });
  }
}

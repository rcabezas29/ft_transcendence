import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FriendsService } from 'src/friends/friends.service';
import { Friends } from 'src/friends/entities/friend.entity';
import { FriendshipStatus } from 'src/friends/entities/friend.entity';
import { IntraAuthService } from 'src/intra-auth/intra-auth.service';

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

  async findUserFriendsByStatus(id: number, status: FriendshipStatus) {
	const friendsRelations: Friends[] = await this.friendsService.findUserFriends(id, status);
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
      throw new BadRequestException();
    }
    throw new NotFoundException();
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

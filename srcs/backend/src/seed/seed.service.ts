import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from 'src/friends/entities/friendship.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'
import { initialData } from './seed-data/seed-data';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        
        @InjectRepository(Friendship)
        private readonly friendsRepository: Repository<Friendship>,
        
        private userService: UsersService
    ) {}
    
    async runSeed() {
        await this.deleteTables();
        await this.insertUsers();
        await this.insertFriends();
        return `seed executed`;
    }
    
    private async deleteTables() {
        const queryBuilderUser = this.userRepository.createQueryBuilder();
        await queryBuilderUser.delete().where({}).execute();
        const queryBuilderFriends = this.friendsRepository.createQueryBuilder();
        await queryBuilderFriends.delete().where({}).execute();
    }
    
    private async insertUsers() {
        const seedUsers = initialData.users;
        const users: User[] = [];
        
        seedUsers.forEach(user => {
            users.push(this.userRepository.create(user))
        });
        
        await this.userRepository.save(users);
    }
    
    private async insertFriends() {
        const seedFriends = initialData.friends;
        const friends: Friendship[] = [];
        
        for (const seedFriend of seedFriends) {
            const user1: User = await this.userService.findOneByUsername(seedFriend.user1);
            const user2: User = await this.userService.findOneByUsername(seedFriend.user2);
            const friend = this.friendsRepository.create({user1Id: user1.id, user2Id: user2.id, status: seedFriend.status});
            friends.push(friend);
        }
        await this.friendsRepository.save(friends);
    }
}
    
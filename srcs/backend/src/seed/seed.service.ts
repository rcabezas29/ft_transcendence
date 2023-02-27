import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedFriendship } from 'src/blocked-friendships/entities/blocked-friendship.entity';
import { Friendship, FriendshipStatus } from 'src/friendships/entities/friendship.entity';
import { Stats } from 'src/stats/entity/stats.entity';
import { StatsService } from 'src/stats/stats.service';
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
        private readonly friendshipsRepository: Repository<Friendship>,

        @InjectRepository(BlockedFriendship)
        private readonly blockedFriendshipsRepository: Repository<BlockedFriendship>,

        @InjectRepository(Stats)
        private readonly statsRepository: Repository<Stats>,
        
        private userService: UsersService,

        private statsService: StatsService
    ) {}
    
    async runSeed() {
        await this.deleteTables();
        await this.insertUsers();
        await this.insertFriendships();
        return `seed executed`;
    }
    
    private async deleteTables() {
        const queryBuilderUser = this.userRepository.createQueryBuilder();
        await queryBuilderUser.delete().where({}).execute();
        const queryBuilderFriends = this.friendshipsRepository.createQueryBuilder();
        await queryBuilderFriends.delete().where({}).execute();
        const queryBuilderBlocked = this.blockedFriendshipsRepository.createQueryBuilder();
        await queryBuilderBlocked.delete().where({}).execute();
        // const queryBuilderStats = this.statsRepository.createQueryBuilder();
        // await queryBuilderStats.delete().where({}).execute();
    }
    
    private async insertUsers() {
        const seedUsers = initialData.users;
        const users: User[] = [];
        
        seedUsers.forEach(user => users.push(this.userRepository.create(user)));
        
        const insertedUsers = await this.userRepository.save(users);
        insertedUsers.forEach(async (user) => await this.statsService.create(user));
    }
    
    private async insertFriendships() {
        const seedFriendships = initialData.friendships;
        const friendships: Friendship[] = [];
        
        for (const seedFriendship of seedFriendships) {
            const user1: User = await this.userService.findOneByUsername(seedFriendship.user1);
            const user2: User = await this.userService.findOneByUsername(seedFriendship.user2);
            const friendship = this.friendshipsRepository.create({user1Id: user1.id, user2Id: user2.id, status: seedFriendship.status});
            friendships.push(friendship);
        }
        await this.friendshipsRepository.save(friendships);

        await this.insertBlockedFriendships(friendships);
    }

    private async insertBlockedFriendships(friendships: Friendship[]) {
        friendships.forEach(async (friendship) => {
            if (friendship.status === FriendshipStatus.Blocked) {
                await this.blockedFriendshipsRepository.save({
                    userId: friendship.user1Id,
                    blockedUserId: friendship.user2Id,
                    friendshipId: friendship.id
                });
            }
        })
    }
}
    
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async runSeed() {
    await this.deleteTables();
    await this.insertUsers();
    return `seed executed`;
  }

  private async deleteTables() {
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    });

    await this.userRepository.save(users);
  }
  
}

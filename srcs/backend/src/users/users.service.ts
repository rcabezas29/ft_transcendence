import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const emailExists = await this.usersRepository.findBy({
      email: createUserDto.email,
    });
    const usernameExists = await this.usersRepository.findBy({
      username: createUserDto.username,
    });
    if (emailExists.length != 0 || usernameExists.length != 0) {
      throw new BadRequestException();
    }

    const user = await this.usersRepository.save(createUserDto);

    const { password, ...result } = user;
    return result;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id: id });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOneBy({ username: username });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email: email });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = {
      id,
      ...updateUserDto,
    };
    const user = await this.usersRepository.preload(userToUpdate);
    if (user) {
      return this.usersRepository.save(user);
    }
    throw new NotFoundException(`User not found: ${id}`);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

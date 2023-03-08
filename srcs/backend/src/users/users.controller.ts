import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  NotFoundException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard, JwtTwoFactorGuard, UserGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtTwoFactorGuard, UserGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtTwoFactorGuard, UserGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
  
  @Get("avatar/:id")
  async getAvatar(@Param("id", ParseIntPipe) id: number) {
	  return this.usersService.getAvatar(id);
  }

  @Post("avatar/:id")
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Param("id", ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
	  return this.usersService.uploadAvatar(id, file);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get(':id/friends')
  getFriends(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getAllUserFriends(id);
  }
}

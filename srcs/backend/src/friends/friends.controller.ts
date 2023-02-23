import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { JwtAuthGuard, UserFriendGuard } from 'src/auth/guards';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @UseGuards(JwtAuthGuard/*, UserFriendGuard*/)
  create(@Body() createFriendshipDto: CreateFriendshipDto) {
    return this.friendsService.create(createFriendshipDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.friendsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, UserFriendGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.friendsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard/*, UserFriendGuard*/)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFriendshipDto: UpdateFriendshipDto) {
    return this.friendsService.update(id, updateFriendshipDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard /*, UserFriendGuard*/)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendsService.remove(id);
  }
}

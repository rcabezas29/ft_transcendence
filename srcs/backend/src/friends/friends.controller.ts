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
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtAuthGuard, UserFriendGuard } from 'src/auth/guards';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, UserFriendGuard)
  create(@Body() createFriendDto: CreateFriendDto) {
    return this.friendsService.create(createFriendDto);
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
  @UseGuards(JwtAuthGuard, UserFriendGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendsService.update(id, updateFriendDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserFriendGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendsService.remove(id);
  }
}

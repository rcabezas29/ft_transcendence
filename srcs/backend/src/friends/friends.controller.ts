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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FriendsService } from './friends.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { JwtAuthGuard, UserInFriendshipGuard } from 'src/auth/guards';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFriendshipDto: CreateFriendshipDto, @Req() req: Request) {
    return this.friendsService.create(createFriendshipDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.friendsService.findAll();
  }
/*
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.friendsService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFriendshipDto: UpdateFriendshipDto) {
    return this.friendsService.update(id, updateFriendshipDto);
  }
*/
  @Patch(':id/accept-request')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  acceptFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.friendsService.handleFriendRequest(id, req.user, 'accept');
  }

  @Delete(':id/deny-request')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  denyFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.friendsService.handleFriendRequest(id, req.user, 'deny');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendsService.remove(id);
  }
}

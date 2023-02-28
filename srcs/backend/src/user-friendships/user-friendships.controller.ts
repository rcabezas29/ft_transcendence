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
import { UserFriendshipsService } from './user-friendships.service';
import { CreateFriendshipDto } from '../friendships/dto/create-friendship.dto';
import { JwtAuthGuard, UserInFriendshipGuard } from 'src/auth/guards';

@Controller('friendships')
export class UserFriendshipsController {
  constructor(private readonly userfriendshipsService: UserFriendshipsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createFriendship(@Body() createFriendshipDto: CreateFriendshipDto, @Req() req: Request) {
    return this.userfriendshipsService.createFriendship(createFriendshipDto, req.user);
  }

  @Get(':id/request-direction')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  getFriendRequestDirection(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userfriendshipsService.getFriendRequestDirection(id, req.user);
  }

  @Get(':id/block-direction')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  getBlockDirection(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userfriendshipsService.getBlockDirection(id, req.user);
  }

  @Patch(':id/block')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  blockFriend(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userfriendshipsService.blockFriend(id, req.user);
  }

  @Patch(':id/unblock')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  unblockFriend(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userfriendshipsService.unblockFriend(id, req.user);
  }

  @Patch(':id/accept-request')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  acceptFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userfriendshipsService.handleFriendRequest(id, req.user, 'accept');
  }

  @Delete(':id/deny-request')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  denyFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userfriendshipsService.handleFriendRequest(id, req.user, 'deny');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  removeFriendship(@Param('id', ParseIntPipe) id: number) {
    return this.userfriendshipsService.removeFriendship(id);
  }
}

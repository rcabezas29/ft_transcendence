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
import { UserFriendshipsService } from './user-friendships.service';
import { CreateFriendshipDto } from '../friendships/dto/create-friendship.dto';
import { JwtTwoFactorGuard, UserInFriendshipGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/users/interfaces/request-with-user.interface';

@Controller('friendships')
export class UserFriendshipsController {
  constructor(private readonly userfriendshipsService: UserFriendshipsService) {}

  @Post()
  @UseGuards(JwtTwoFactorGuard)
  createFriendship(@Body() createFriendshipDto: CreateFriendshipDto, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.createFriendship(createFriendshipDto, req.user);
  }

  @Get(':id/request-direction')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  getFriendRequestDirection(@Param('id', ParseIntPipe) friendshipId: number, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.getFriendRequestDirection(friendshipId, req.user);
  }

  @Get(':id/block-direction')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  getBlockDirection(@Param('id', ParseIntPipe) friendshipId: number, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.getBlockDirection(friendshipId, req.user);
  }

  @Patch(':id/block')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  blockFriend(@Param('id', ParseIntPipe) friendshipId: number, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.blockFriend(friendshipId, req.user);
  }

  @Patch(':id/unblock')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  unblockFriend(@Param('id', ParseIntPipe) friendshipId: number, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.unblockFriend(friendshipId, req.user);
  }

  @Patch(':id/accept-request')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  acceptFriendRequest(@Param('id', ParseIntPipe) friendshipId: number, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.handleFriendRequest(friendshipId, req.user, 'accept');
  }

  @Delete(':id/deny-request')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  denyFriendRequest(@Param('id', ParseIntPipe) friendshipId: number, @Req() req: RequestWithUser) {
    return this.userfriendshipsService.handleFriendRequest(friendshipId, req.user, 'deny');
  }

  @Delete(':id')
  @UseGuards(JwtTwoFactorGuard, UserInFriendshipGuard)
  removeFriendship(@Param('id', ParseIntPipe) friendshipId: number) {
    return this.userfriendshipsService.removeFriendship(friendshipId);
  }
}

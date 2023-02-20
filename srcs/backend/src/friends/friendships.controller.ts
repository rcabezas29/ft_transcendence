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
import { FriendshipsService } from './friendships.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { JwtAuthGuard, UserInFriendshipGuard } from 'src/auth/guards';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFriendshipDto: CreateFriendshipDto, @Req() req: Request) {
    return this.friendshipsService.create(createFriendshipDto, req.user);
  }
/*
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.friendshipsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.friendshipsService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFriendshipDto: UpdateFriendshipDto) {
    return this.friendshipsService.update(id, updateFriendshipDto);
  }
*/
  @Patch(':id/accept-request')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  acceptFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.friendshipsService.handleFriendRequest(id, req.user, 'accept');
  }

  @Delete(':id/deny-request')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  denyFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.friendshipsService.handleFriendRequest(id, req.user, 'deny');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserInFriendshipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendshipsService.remove(id);
  }
}
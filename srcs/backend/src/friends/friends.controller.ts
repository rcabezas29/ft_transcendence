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
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Request } from 'express';
import { JwtAuthGuard, UserFriendGuard } from 'src/auth/guards';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @UseGuards(JwtAuthGuard/*, UserFriendGuard*/)
  create(@Body() createFriendDto: CreateFriendDto) {
    console.log(createFriendDto)
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

  /*
  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserFriendGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendsService.update(id, updateFriendDto);
  }
*/
  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserFriendGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendsService.remove(id);
  }

  
  //@Patch(':friendId')
  //@UseGuards(JwtAuthGuard/*, UserFriendGuard*/)
  /*updateByFriendId(@Param('friendId', ParseIntPipe) friendId: number, @Body() updateFriendDto: UpdateFriendDto, @Req() req: Request) {
    return this.friendsService.updateByFriendId(friendId, (req.user as JwtPayload).id, updateFriendDto);
  }
  */
}

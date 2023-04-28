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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard, JwtTwoFactorGuard, UserGuard, AdminGuard, OwnerGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @UseGuards(JwtTwoFactorGuard, OwnerGuard)
  @Patch('role/:id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() newRole: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, newRole);
  }

  @UseGuards(JwtTwoFactorGuard, AdminGuard)
  @Patch(':id/ban')
  banUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.banFromWebsite(id);
  }

  @UseGuards(JwtTwoFactorGuard, AdminGuard)
  @Patch(':id/unban')
  unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.unbanFromWebsite(id);
  }

  @UseGuards(JwtTwoFactorGuard, UserGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.anonimizeUser(id);
  }
  
  @Get("avatar/:id")
  async getAvatar(@Param("id", ParseIntPipe) id: number) {
	  return this.usersService.getAvatar(id);
  }

  @UseGuards(JwtTwoFactorGuard)
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

  @UseGuards(JwtTwoFactorGuard)
  @Get('search/:username')
  findUsernameMatches(@Param('username') usernameSegment: string) {
    return this.usersService.findUsernameMatches(usernameSegment);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('match-history/:id')
  getUserMatchHistory(@Param('id', ParseIntPipe) id: number) {
	return this.usersService.getUserMatchHistory(id);
  }
}

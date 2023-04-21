import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, NotEquals } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../interfaces/user-roles';

export class UpdateUserRoleDto extends PartialType(CreateUserDto) {
  @IsEnum(UserRole)
  @NotEquals(UserRole.OWNER)
  role: UserRole;
}

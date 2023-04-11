import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(1)
  username?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  elo?: number;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  //@Matches(
  //    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //    message: 'The password must have a Uppercase, lowercase letter and a number'
  //})
  password?: string;

  @IsOptional()
  intraUsername?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  twoFactorAuthenticationSecret?: string;

  @IsOptional()
  isTwoFactorAuthenticationEnabled?: boolean;
}

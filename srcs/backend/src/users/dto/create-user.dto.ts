import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @Matches(
      /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'The password must have a Uppercase, lowercase letter and a number'
  })
  password: string;
}

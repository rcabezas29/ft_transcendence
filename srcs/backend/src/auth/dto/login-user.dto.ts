import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(4)
    @MaxLength(50)
    password: string;
}
import { IsArray, IsNumber, Length } from "class-validator";

export class CreateMatchHistoryDto {
    @IsNumber()
    user1Id: number;

    @IsNumber()
    user2Id: number;

    @IsNumber()
    winner: number;

    @IsArray()
    @IsNumber()
    @Length(2)
    score: number[];
}

import { IsArray, IsNumber, IsOptional, Length } from "class-validator";

export class CreateMatchHistoryDto {
    @IsNumber()
    user1Id: number;

    @IsNumber()
    user2Id: number;

	@IsOptional()
    @IsNumber()
    winner?: number;

	@IsOptional()
	@IsNumber()
    loser?: number;

    @IsArray()
    @IsNumber()
    @Length(2)
    score: number[];
}

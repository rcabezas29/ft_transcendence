import { IsOptional } from "class-validator";

export class UpdateStatsDto {

  @IsOptional()
  wonGames: number;

  @IsOptional()
  lostGames: number;

  @IsOptional()
  scoredGoals: number;

  @IsOptional()
  receivedGoals: number;
}

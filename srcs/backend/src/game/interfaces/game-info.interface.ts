export enum GameResult {
    Lose,
    Win,
    Draw,
}

export interface GameStatsInfo {
    gameResult: GameResult,
    scoredGoals: number,
    receivedGoals: number,
}

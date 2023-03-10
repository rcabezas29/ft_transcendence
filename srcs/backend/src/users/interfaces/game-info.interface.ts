export enum GameResult {
    Lose,
    Win,
    Draw,
}

export interface GameInfo {
    gameResult: GameResult,
    scoredGoals: number,
    receivedGoals: number,
}

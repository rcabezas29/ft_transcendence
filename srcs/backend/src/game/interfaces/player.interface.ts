import { GatewayUser } from "src/gateway-manager/interfaces";
import { GameResult } from "./game-info.interface";

export interface Player {
    user: GatewayUser;
    score: number;
    result: GameResult;
}

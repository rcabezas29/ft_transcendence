import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import Game from './game.class';

@Injectable()
export class GameService {
  public server: Server;
  public games: Game[] = [];

  constructor(
    private usersService: UsersService,
    private matchHistoryService: MatchHistoryService,
    private gatewayManagerService: GatewayManagerService
    ) {}

  createGame(user1: GatewayUser, user2: GatewayUser) {
    const game = new Game(user1, user2, this.server, this.usersService, this.matchHistoryService, this.gatewayManagerService);
    this.games.push(game);
  }

  isPlayerInAGame(playerId: number): boolean {
    for (const game of this.games) {
      if (game.players[0].id === playerId || game.players[1].id === playerId)
        return true;
    }
    return false;
  }

  joinPlayerToGame(player: GatewayUser) {
    for (const game of this.games) {
      if (game.players[0].id === player.id || game.players[1].id === player.id) {
        game.rejoinPlayer(player);
        player.socket.emit('rejoin-game');
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import Game, { GameStatus } from './game.class';

@Injectable()
export class GameService {
  public server: Server;
  public ongoingGames: Game[] = [];

  constructor(
    private usersService: UsersService,
    private matchHistoryService: MatchHistoryService,
    private gatewayManagerService: GatewayManagerService
    ) {}

  createGame(user1: GatewayUser, user2: GatewayUser) {
    const game = new Game(user1, user2, this.server, this.usersService, this.matchHistoryService, this.gatewayManagerService);
    this.ongoingGames.push(game);
  }

  onEndGame(gameName: string) {
	const gameIndex = this.ongoingGames.findIndex(game => game.name == gameName);
	if (gameIndex != -1)
		this.ongoingGames.splice(gameIndex, 1);
  }

  sendOngoingMatchesToUser(client: GatewayUser) {
	const games = this.ongoingGames.map((game) => {
		return {
			name: game.name,
			player1: game.players[0].username,
			player2: game.players[1].username
		}
	});

	client.socket.emit("ongoing-games", games)
  }

  isPlayerInAGame(playerId: number): boolean {
    for (const game of this.ongoingGames) {
      if (game.status != GameStatus.End && (game.players[0].id === playerId || game.players[1].id === playerId))
        return true;
    }
    return false;
  }

  joinPlayerToGame(player: GatewayUser) {
    for (const game of this.ongoingGames) {
      if (game.status != GameStatus.End && (game.players[0].id === player.id || game.players[1].id === player.id)) {
        game.rejoinPlayer(player);
        player.socket.emit('rejoin-game');
      }
    }
  }

  joinSpectatorToGame(spectator: GatewayUser, gameName: string) {
	const gameIndex = this.ongoingGames.findIndex((game) => game.name == gameName);
	if (gameIndex == -1) {
		spectator.socket.emit("spectate-game", false);
		return;
	}
	this.ongoingGames[gameIndex].viwers.push(spectator);
	spectator.socket.join(gameName);
  }
  findGameByPlayerUserId(playerId: number): Game {
    const game: Game = this.ongoingGames.find((game) =>
      game.status != GameStatus.End
      && (game.players[0].id === playerId || game.players[1].id === playerId)
    );
    return game;
  }

  findPlayerIndexByGame(playerId: number, game: Game): number {
    if (game.players[0].id === playerId)
      return 0;
    else if (game.players[1].id === playerId)
      return 1;
    else
      return -1;
  }

  endGamePrematurely(userId: number): void {
    const game = this.findGameByPlayerUserId(userId);
    const playerIndex = this.findPlayerIndexByGame(userId, game);
    const winner = playerIndex === 0 ? 1 : 0;
    game.end(winner);
  }
}

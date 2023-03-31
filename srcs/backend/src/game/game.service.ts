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
  public ongoingGames: Game[] = [];

  constructor(
    private usersService: UsersService,
    private matchHistoryService: MatchHistoryService,
    private gatewayManagerService: GatewayManagerService
    ) {}

  createGame(user1: GatewayUser, user2: GatewayUser) {
    const game = new Game(user1, user2, this.server, this.usersService, this.matchHistoryService, this.gatewayManagerService);
    game.setStartGameCallback((gameName: string) => this.onStartGame(gameName));
    game.setEndGameCallback((gameName: string) => this.onEndGame(gameName));
    this.ongoingGames.push(game);
    game.start();
  }

  onStartGame(gameName: string) {
    const game: Game = this.findGameByGameName(gameName);
    this.notifyFriendsOfGameStart(game.players[0].user.id, game.players[1].user.id);
  }

  onEndGame(gameName: string) {
    const game: Game = this.findGameByGameName(gameName);
    this.notifyFriendsOfGameEnd(game.players[0].user.id, game.players[1].user.id);
    this.deleteGameFromOngoingGames(gameName);
  }

  private deleteGameFromOngoingGames(gameName: string): void {
    const gameIndex = this.ongoingGames.findIndex(game => game.name == gameName);
    if (gameIndex != -1)
      this.ongoingGames.splice(gameIndex, 1);
  }

  sendOngoingMatchesToUser(client: GatewayUser) {
    const games = this.ongoingGames.map((game) => {
      return {
        name: game.name,
        player1: game.players[0].user.username,
        player2: game.players[1].user.username
      }
    });

    client.socket.emit("ongoing-games", games)
  }

  isPlayerInAGame(playerId: number): boolean {
    for (const game of this.ongoingGames) {
      if (game.players[0].user.id === playerId || game.players[1].user.id === playerId)
        return true;
    }
    return false;
  }

  joinPlayerToGame(player: GatewayUser) {
    for (const game of this.ongoingGames) {
      if (this.isPlayerInAGame(player.id)) {
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
      (game.players[0].user.id === playerId || game.players[1].user.id === playerId)
    );
    return game;
  }

  findGameByGameName(gameName: string): Game {
    const game: Game = this.ongoingGames.find((game) => game.name == gameName);
    return game;
  }

  findPlayerIndexByGame(playerId: number, game: Game): number {
    if (game.players[0].user.id === playerId)
      return 0;
    else if (game.players[1].user.id === playerId)
      return 1;
    else
      return -1;
  }

  endGamePrematurely(userId: number): void {
    const game = this.findGameByPlayerUserId(userId);
    const playerIndex = this.findPlayerIndexByGame(userId, game);
    game.end(playerIndex);
  }

  async notifyFriendsOfGameStart(player0Id: number, player1Id: number) {
    let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(player0Id);
    friends.forEach(friend => {
        friend.socket.emit('friend-in-a-game', player0Id);
    });
    
    friends = await this.gatewayManagerService.getAllUserConnectedFriends(player1Id);
    friends.forEach(friend => {
        friend.socket.emit('friend-in-a-game', player1Id);
    });
  }

  async notifyFriendsOfGameEnd(player0Id: number, player1Id: number) {
    let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(player0Id);
    friends.forEach(friend => {
        friend.socket.emit('friend-game-ended', player0Id);
    });
    
    friends = await this.gatewayManagerService.getAllUserConnectedFriends(player1Id);
    friends.forEach(friend => {
        friend.socket.emit('friend-game-ended', player1Id);
    });
  }
}

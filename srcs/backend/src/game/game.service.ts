import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import Game from './classes/game.class';
import CrazyGame from './classes/crazy-game.class';
import { PowerUpsGame } from './classes/powerups-game.class';
import { GameSelection, ChallengePlayers } from './interfaces';

@Injectable()
export class GameService {
  public server: Server;
  public ongoingGames: Game[] = [];

  constructor(
    private usersService: UsersService,
    private matchHistoryService: MatchHistoryService,
    private gatewayManagerService: GatewayManagerService
    ) {
      this.gatewayManagerService.addOnNewConnectionCallback((client: GatewayUser) => this.sendOngoingMatchesToUser(client))
    }

  createGame(user1: GatewayUser, user2: GatewayUser, gameSelection: GameSelection) {
    if (this.isPlayerInAGame(user1.id) || this.isPlayerInAGame(user2.id)) {
      console.log("Cannot create game: one of the players is already in a game.");
      return;
    }

    let game: Game;
    if (gameSelection === GameSelection.Original) {
      game = new Game(user1, user2, this.server, this.usersService, this.matchHistoryService, this.gatewayManagerService);
    } else if (gameSelection === GameSelection.SuperCool) {
      game = new PowerUpsGame(user1, user2, this.server, this.usersService, this.matchHistoryService, this.gatewayManagerService);
    } else if (gameSelection === GameSelection.Crazy) {
      game = new CrazyGame(user1, user2, this.server, this.usersService, this.matchHistoryService, this.gatewayManagerService);
    }
    game.setStartGameCallback((gameName: string) => this.onStartGame(gameName));
    game.setEndGameCallback((gameName: string) => this.onEndGame(gameName));
    this.ongoingGames.push(game);
    game.start();
  }

  onStartGame(gameName: string) {
    const game: Game = this.findGameByGameName(gameName);
    this.notifyFriendsOfGameStart(game.players[0].user.id, game.players[1].user.id);
	  this.sendOngoingMatchesToAllUsers();
  }

  onEndGame(gameName: string) {
    const game: Game = this.findGameByGameName(gameName);
    this.notifyFriendsOfGameEnd(game.players[0].user.id, game.players[1].user.id);
    this.deleteGameFromOngoingGames(gameName);
    this.sendOngoingMatchesToAllUsers();
  }

  private deleteGameFromOngoingGames(gameName: string): void {
    const gameIndex = this.ongoingGames.findIndex(game => game.name == gameName);
    if (gameIndex != -1)
      this.ongoingGames.splice(gameIndex, 1);
  }

  public getOngoingMatches() {
    const games = this.ongoingGames.map((game) => {
      return {
        name: game.name,
        player1: game.players[0].user.username,
        player1Id: game.players[0].user.id,
        player1Score: game.players[0].score,
        player2: game.players[1].user.username,
        player2Id: game.players[1].user.id,
        player2Score: game.players[1].score,
      }
    });

    return games;
  }

  sendOngoingMatchesToUser(client: GatewayUser) {
    client.socket.emit("ongoing-games", this.getOngoingMatches());
  }

  sendOngoingMatchesToAllUsers() {
	  this.server.emit("ongoing-games", this.getOngoingMatches());
  }

  isPlayerInAGame(playerId: number): boolean {
    if (this.findGameByPlayerUserId(playerId))
      return true;
    return false;
  }

  joinPlayerToGame(player: GatewayUser) {
    for (const game of this.ongoingGames) {
      if (player && this.isPlayerInAGame(player.id)) {
        game.rejoinPlayer(player);
        player.socket.emit('rejoin-game', {
          user1: game.players[0].user.username,
          user2: game.players[1].user.username,
        });
      }
    }
  }

  joinSpectatorToGame(spectator: GatewayUser, gameName: string) {
    const gameIndex = this.ongoingGames.findIndex((game) => game.name == gameName);
    if (gameIndex == -1) {
      spectator.socket.emit("spectate-game", false);
      return;
    }

    if (!this.ongoingGames[gameIndex].viwers.find((viewer) => viewer.id === spectator.id)) {
      this.ongoingGames[gameIndex].viwers.push(spectator);
      spectator.socket.join(gameName);
    }
	
    const gamePlayers = {
      player1: this.ongoingGames[gameIndex].players[0].user.username,
      player2: this.ongoingGames[gameIndex].players[1].user.username
    };

    spectator.socket.emit("spectate-game-players", gamePlayers);
  }

  deleteSpectatorFromGame(spectator: GatewayUser, gameName: string) {
    const gameIndex = this.ongoingGames.findIndex((game) => game.name == gameName);
    if (gameIndex == -1) {
      spectator.socket.emit("spectate-game", false);
      return;
    }

    const viewerIndex: number = this.ongoingGames[gameIndex].viwers.findIndex(viewer => {
      if (viewer.id == spectator.id)
        return viewer;
    })

    this.ongoingGames[gameIndex].viwers.splice(viewerIndex, 1);

    spectator.socket.leave(gameName);
  }

  findGameByPlayerUserId(playerId: number): Game | undefined {
    const game: Game | undefined = this.ongoingGames.find((game) =>
      (game.players[0].user.id === playerId || game.players[1].user.id === playerId)
    );
    return game;
  }

  findGameByGameName(gameName: string): Game {
    const game: Game = this.ongoingGames.find((game) => game.name == gameName);
    return game;
  }

  findPlayerIndexByGame(playerId: number, game: Game): number {
    if (game.players[0]?.user.id === playerId)
      return 0;
    else if (game.players[1]?.user.id === playerId)
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

  /* user1 is the one who invited, user2 is the one who accepts the challenge */
  acceptChallenge(clientId: number, players: ChallengePlayers): boolean {
    const inviterUser: GatewayUser = this.gatewayManagerService.getClientByUserId(
      players.user1Id,
    );
    const invitedUser: GatewayUser = this.gatewayManagerService.getClientByUserId(
      players.user2Id,
    );

    if (this.isPlayerInAGame(players.user1Id)) {
      return false;
    }

    if (this.isPlayerInAGame(players.user2Id)) {
      this.endGamePrematurely(players.user2Id);
    }

    inviterUser.socket.emit('challenge-accepted', clientId);
    this.createGame(inviterUser, invitedUser, GameSelection.Original);
    return true;
  }

  refuseChallenge(challenger: GatewayUser, refuserId: number) {
    challenger.socket.emit('challenge-refused', refuserId);
  }

  cancelChallenge(user1: GatewayUser, user2: GatewayUser) {
    user1.socket.emit('challenge-canceled', user2.id);
    user2.socket.emit('challenge-canceled', user1.id);
  }
}

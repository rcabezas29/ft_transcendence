import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { MatchmakingService } from './matchmaking.service';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

interface ChallengePlayers {
  user1Id: number,
  user2Id: number,
}

@WebSocketGateway()
export class GameGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private gatewayManagerService: GatewayManagerService,
    private matchmakingService: MatchmakingService,
    private gameService: GameService,
  ) {}

  afterInit(server: Server) {
    this.gameService.server = server;
  }

  @SubscribeMessage('search-game')
  handleMessage(client: any): void {
    const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(
      client.id,
    );
    this.matchmakingService.searchGame(user);
  }

  @SubscribeMessage('accept-challenge')
  challengeGame(client: Socket, players: ChallengePlayers) {
    const user1: GatewayUser = this.gatewayManagerService.getClientByUserId(
      players.user1Id,
    );
    const user2: GatewayUser = this.gatewayManagerService.getClientByUserId(
      players.user2Id,
    );
    user1.socket.emit('challenge-accepted');
    this.gameService.createGame(user1, user2);
  }

  @SubscribeMessage('ongoing-games')
  getOngoingGames(client: Socket) {
	const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
	this.gameService.sendOngoingMatchesToUser(user);
  }
  
  @SubscribeMessage('refuse-challenge')
  refuseGame(client: Socket, challengerId: number) {
    const challenger: GatewayUser = this.gatewayManagerService.getClientByUserId(challengerId);
    challenger.socket.emit('challenge-refused', this.gatewayManagerService.getClientBySocketId(client.id).id);
  }

  @SubscribeMessage('check-game-continuity')
  playerContinuity(client: Socket, playerId: number) {
    if (this.gameService.isPlayerInAGame(playerId)) {
      let player: GatewayUser = this.gatewayManagerService.getClientByUserId(playerId);
      this.gameService.joinPlayerToGame(player);
    }
  }

  @SubscribeMessage('spectate-game')
  spectateGame(client: Socket, gameName: string) {
	let spectator: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
	this.gameService.joinSpectatorToGame(spectator, gameName);
  }

  @SubscribeMessage('end-game-prematurely')
  endGamePrematurely(client: Socket) {
    const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
    this.gameService.endGamePrematurely(user.id);
  }
}

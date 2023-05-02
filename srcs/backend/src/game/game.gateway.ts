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
import { GameSelection, ChallengePlayers } from './interfaces';

enum PaddleColorSelection {
  Gray = "#D9D9D9",
  Orange = "#D64B24",
  Sky = "#45D7E7",
  Violet = "#8589EA",
  Pink = "#EC3F74",
  Burgundy = "#893168",
  Green = "#0A8754",
  Yellow = "#E7D352",
}

interface GameCustomization {
  gameSelection: GameSelection;
  paddleColor: PaddleColorSelection;
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
  handleMessage(client: any, gameCustomization: GameCustomization): void {
    const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(
      client.id,
    );
    this.matchmakingService.searchGame(user, gameCustomization);
  }

  @SubscribeMessage('cancel-search')
  cancelSearch(client: Socket) {
    const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
    this.matchmakingService.cancelSearch(user);
  }

  @SubscribeMessage('accept-challenge')
  challengeGame(client: Socket, players: ChallengePlayers) {
    const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
    return this.gameService.acceptChallenge(user.id, players);
  }

  @SubscribeMessage('refuse-challenge')
  refuseChallenge(client: Socket, challengerId: number) {
    const challenger: GatewayUser = this.gatewayManagerService.getClientByUserId(challengerId);
    const challenged: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
    this.gameService.refuseChallenge(challenger, challenged.id);
  }

  @SubscribeMessage('cancel-challenge')
  cancelChallenge(client: Socket, challengerId: number) {
    const challenger: GatewayUser = this.gatewayManagerService.getClientByUserId(challengerId);
    const challenged: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
    this.gameService.cancelChallenge(challenger, challenged);
  }

  @SubscribeMessage('ongoing-games')
  getOngoingGames(client: Socket) {
	const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
	this.gameService.sendOngoingMatchesToUser(user);
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

  @SubscribeMessage('spectate-leave')
  spectateLeave(client: Socket, gameName: string) {
	let spectator: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
	this.gameService.deleteSpectatorFromGame(spectator, gameName);
  }

  @SubscribeMessage('end-game-prematurely')
  endGamePrematurely(client: Socket) {
    const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
    this.gameService.endGamePrematurely(user.id);
  }
}

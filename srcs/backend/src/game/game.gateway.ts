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
import { GameSelection } from './interfaces/game-selection.interface';

interface ChallengePlayers {
  user1Id: number,
  user2Id: number,
}

enum    PaddleColorSelection {
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
    const user1IsAlreadyPlaying = this.gameService.findGameByPlayerUserId(players.user1Id);
    const user2IsAlreadyPlaying = this.gameService.findGameByPlayerUserId(players.user2Id);
   /*if (user1IsAlreadyPlaying || user2IsAlreadyPlaying) {
      //this.refuseGame(client, players.user1Id);
      const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
      this.gameService.endGamePrematurely(user.id);
      return;
    }*/

    //TODO: si yo acepto un challenge mientras yo juego, me saca de la partida actual;
    // si yo he mandado muchos challenges y me aceptan uno (o ya estoy jugando), que en
    //cuanto empiezo a jugar, me cancele todos los challenges que haya mandado yo
    if (user1IsAlreadyPlaying) {
      this.gameService.endGamePrematurely(players.user1Id);
    }

    if (user2IsAlreadyPlaying) {
      this.gameService.endGamePrematurely(players.user2Id);
    }

    const user1: GatewayUser = this.gatewayManagerService.getClientByUserId(
      players.user1Id,
    );
    const user2: GatewayUser = this.gatewayManagerService.getClientByUserId(
      players.user2Id,
    );
    user1.socket.emit('challenge-accepted', this.gatewayManagerService.getClientBySocketId(client.id).id);
    this.gameService.createGame(user1, user2, GameSelection.Original);
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

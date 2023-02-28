import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { MatchmakingService } from './matchmaking.service';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { Socket } from 'node:dgram';

interface ChallengePlayers {
  user1Id: string,
  user2Id: string,
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

  @SubscribeMessage('challenge-game')
  challengeGame(_: Socket, players: ChallengePlayers) {
    const user1: GatewayUser = this.gatewayManagerService.getClientBySocketId(
      players.user1Id,
    );
    const user2: GatewayUser = this.gatewayManagerService.getClientBySocketId(
      players.user2Id,
    );
    this.gameService.createGame(user1, user2);
  }
}

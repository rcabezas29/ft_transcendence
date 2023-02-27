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
}

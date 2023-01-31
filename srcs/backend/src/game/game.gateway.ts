import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { MatchmakingService } from './matchmaking.service';

@WebSocketGateway()
export class GameGateway {
	
	constructor(
		private gatewayManagerService: GatewayManagerService,
		private matchmakingService: MatchmakingService
	) {}

	@SubscribeMessage('search-game')
	handleMessage(client: any): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.matchmakingService.searchGame(user);
	}
}

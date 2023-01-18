import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { map } from 'rxjs';
import { Socket } from 'socket.io'
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';

@WebSocketGateway({cors: true})
export class ChatGateway  {

	constructor(
		private gatewayManagerService: GatewayManagerService
	) { }

	@SubscribeMessage("fetch-users")
	fetchUsers(client: Socket) {
		const users: GatewayUser[] = this.gatewayManagerService.getAllClients();
		const userFriends = users.filter((user) => user.socket !== client);
		const usersPayload = userFriends.map((user) => user.id );

		client.emit('fetch-users', usersPayload);
	}

	@SubscribeMessage("directMessage")
	directMessage(client: Socket, payload: any) {
		const user = this.gatewayManagerService.getClientBySocketId(client.id);
	}

}
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GatewayManagerService } from './gateway-manager.service';
import type { Socket, Server } from 'socket.io'
import { GatewayUser } from './interfaces/gateway-user.interface';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({cors: true})
export class GatewayManagerGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private gatewayManagerService: GatewayManagerService,
		private jwtService: JwtService,
	) { }

	handleConnection(client: Socket, ...args: any[]) {
		const clientToken = client.handshake.auth.token;
		let validToken;

		try {
			validToken = this.jwtService.verify(clientToken);
		}
		catch (e) {
			client.disconnect();
			return;
		}
		
		const gatewayUser: GatewayUser = {
			id: validToken.id,
			socket: client,
			token: clientToken
		}

		const userExists = this.gatewayManagerService.getClientByUserId(gatewayUser.id);
		if (userExists) {
			client.emit("alreadyConnected");
			client.disconnect();
			return;
		}

		this.gatewayManagerService.addClient(gatewayUser);
	}

	handleDisconnect(client: Socket) {
		this.gatewayManagerService.removeClient(client.id);
	}

}

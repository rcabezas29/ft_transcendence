import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GatewayManagerService } from './gateway-manager.service';
import type { Socket, Server } from 'socket.io'
import { GatewayUser } from './interfaces/gateway-user.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@WebSocketGateway({cors: true})
export class GatewayManagerGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private gatewayManagerService: GatewayManagerService,
		private jwtService: JwtService,
		private usersService: UsersService
	) { }

	async handleConnection(client: Socket, ...args: any[]) {
		const clientToken = client.handshake.auth.token;
		let validToken;

		try {
			validToken = this.jwtService.verify(clientToken);
		}
		catch (e) {
			client.disconnect();
			return;
		}

		const user: User = await this.usersService.findOne(validToken.id);
		if (!user) {
			client.disconnect();
			return;
		}

		const gatewayUser: GatewayUser = {
			id: validToken.id,
			socket: client,
			token: clientToken,
			username: user.username,
		}

		const userExists = this.gatewayManagerService.getClientByUserId(gatewayUser.id);
		if (userExists) {
			client.emit("alreadyConnected");
			client.disconnect();
			return;
		}

		this.gatewayManagerService.addClient(gatewayUser);
		const onNewConnectionCallbacks = this.gatewayManagerService.getOnNewConnectionCallbacks();
		onNewConnectionCallbacks.forEach((callback) => {
			callback(gatewayUser);
		});
	}

	handleDisconnect(client: Socket) {
		const gatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const onDisconnectionCallbacks = this.gatewayManagerService.getOnDisconnectionCallback();
		onDisconnectionCallbacks.forEach((callback) => {
			callback(gatewayUser);
		});
		this.gatewayManagerService.removeClient(client.id);
	}

}

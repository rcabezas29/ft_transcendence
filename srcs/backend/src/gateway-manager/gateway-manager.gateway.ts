import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
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

	@WebSocketServer()
	server: Server;

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

		const user: User = await this.usersService.findOneById(validToken.id);
		if (!user) {
			client.disconnect();
			return;
		}

		const gatewayUser: GatewayUser = {
			id: validToken.id,
			socket: client,
			token: clientToken,
			username: user.username,
			elo: user.elo,
			isGaming: false,
			color: "",
			role: user.role
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
		if (!gatewayUser)
			return;
		const onDisconnectionCallbacks = this.gatewayManagerService.getOnDisconnectionCallbacks();
		onDisconnectionCallbacks.forEach((callback) => {
			callback(gatewayUser, this.server);
		});
		this.gatewayManagerService.removeClient(client.id);
	}

	@SubscribeMessage("user-updated")
	notifyOfUpdatedUser(client: Socket): Promise<void> {
		const gatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		if (!gatewayUser)
			return;
		this.gatewayManagerService.onUserUpdated(gatewayUser);
	}
}

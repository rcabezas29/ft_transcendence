import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Subscriber } from 'rxjs';
import { Socket } from 'socket.io'

interface User {
	socket: Socket
}

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

	private users: User[] = [];

	handleConnection(client: Socket, ...args: any[]) {
		this.users.push({socket: client});
		this.users.forEach((user) => user.socket.emit('fetch_users', this.getUsersIds()));
	}

	handleDisconnect(client: Socket) {
		console.log("User disconnected");

		this.users = this.users.filter((user) => user.socket.id != client.id)
	}

	getUsersIds(): string {
		return JSON.stringify(this.users.map((user) => user.socket.id));
	}

	@SubscribeMessage('fetch_users')
	fetchUsers(client: Socket, payload: any): void {
		console.log("Fetch users!");
		client.emit('fetch_users', this.getUsersIds());
	}

	@SubscribeMessage('message')
	handleMessage(client: Socket, payload: any): void {
		const user = this.users.find((user) => user.socket.id == payload.to);
	
		if (!user)
			return;

		if (payload.message.length == 0)
			return;

		user.socket.emit('message', {from: client.id, message: payload.message})
	}
}
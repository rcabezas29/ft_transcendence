import type { Socket } from 'socket.io';

export interface GatewayUser {
	id: number,
	socket: Socket,
	token: string,
}
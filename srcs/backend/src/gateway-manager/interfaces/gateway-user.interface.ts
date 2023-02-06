import type { Socket } from 'socket.io';

export interface GatewayUser {
	id: number,
	username: string,
	socket: Socket,
	token: string,
	elo?: number,
}
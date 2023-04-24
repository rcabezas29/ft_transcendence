import type { Socket } from 'socket.io';
import { UserRole } from 'src/users/interfaces/user-roles';

export interface GatewayUser {
	id: number,
	username: string,
	socket: Socket,
	token: string,
	elo?: number,
	isGaming: boolean,
	color: string,
	role: UserRole
}
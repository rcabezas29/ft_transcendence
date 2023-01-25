import { reactive } from 'vue'
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import jwt_decode from "jwt-decode";
import { chatController } from "./chatController";

export interface JwtPayload {
    id: number;
	iat: number;
	exp: number;
}

interface FetchedUser {
	id: number;
	username: string;
}

class User {
	public token: string | null = null;
	public socket: Socket | null = null;
	public socketId: string | undefined;
	public alreadyConnected: boolean = false;
	public id: number = -1;
	public username: string = '';

	async auth(access_token: string): Promise<void> {
		this.token = access_token;
		localStorage.setItem("token", access_token);
		try {
			const decoded: JwtPayload = jwt_decode(this.token);
			this.id = decoded.id;

			const fetchUserData = await fetch(`http://localhost:3000/users/${this.id}`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${user.token}`
				}
			});

			const fetchedUser: FetchedUser = await fetchUserData.json();
			this.username = fetchedUser.username;

		} catch (error) {
			console.log(error, 'error from decoding token');
		}

		if (!this.socket) {
			this.socket = io("http://localhost:3000/", {auth: {token: access_token}});
			this.socket.on("connect", () => { this.onConnect(); });
			this.socket.on("disconnect", () => { this.onDisconnect(); });
			this.socket.on("alreadyConnected", () => { this.onAlreadyConnected(); });
		}
	}

	onConnect() {
		this.socketId = this.socket?.id;
		chatController.setEventsHandlers();
	}

	onDisconnect() {
		this.socketId = undefined;
	}

	onAlreadyConnected() {
		this.alreadyConnected = true;
	}

	async validateToken(token: string): Promise<boolean> {
		const httpResponse = await fetch("http://localhost:3000/auth/validate", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
			}
		});

		return httpResponse.status == 200 ? true : false;
	}

	async checkLocalStorage(): Promise<string | null> {
		const localStorageToken = localStorage.getItem("token");

		if (!localStorageToken)
			return null;

		const validToken = await this.validateToken(localStorageToken);

		if (!validToken)
			return null;

		return localStorageToken;
	}

	isLogged(): boolean {	
		return this.token != null;
	}
	
	logout(): void {
		localStorage.removeItem("token");
		this.token = null;
		this.socket?.disconnect();
		this.socket = null
	}

}

export const user = reactive<User>(new User);
import { reactive } from 'vue'
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

class User {
	public token: string | null = null;
	public socket: Socket | null = null;

	auth(access_token: string): void {
		this.token = access_token;
		localStorage.setItem("token", access_token);
		this.socket = io("http://localhost:3000/");
	}

	async validateToken(token: string): Promise<boolean> {
		const httpResponse = await fetch("http://localhost:3000/auth/validate", {
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
		this.socket = null
	}
}

export const user = reactive<User>(new User);
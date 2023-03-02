import { reactive } from 'vue'
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import jwt_decode from "jwt-decode";
import { directMessageController } from './directMessageController';
import { channelController } from './channelController';
import { gameController } from './gameController';
import { friendsController } from './friendsController';

export interface JwtPayload {
    id: number;
	isSecondFactorAuthenticated: boolean;
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
	private isLogged: boolean = false;
	private onLogoutCallbacks: Function[] = [];

	async auth(access_token: string): Promise<void> {
		if (this.token && this.token === access_token)
			return;

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

			const response = await fetchUserData.json();

			const fetchedUser: FetchedUser = response;
			this.username = fetchedUser.username;

		} catch (error) {
			console.log(error, 'error from decoding token');
			return ;
		}

		const needSecondFactorAuth = await this.checkIfSecondFactorAuthenticationIsNeeded(this.token);
		if (!needSecondFactorAuth) {
			this.isLogged = true;

			if (!this.socket) {
				this.socket = io("http://localhost:3000/", {auth: {token: access_token}});
				this.socket.on("connect", () => { this.onConnect(); });
				this.socket.on("disconnect", () => { this.onDisconnect(); });
				this.socket.on("alreadyConnected", () => { this.onAlreadyConnected(); });
			}
		}
	}

	async register(username: string, email: string, password: string) {
		const createUser = { username, email, password };

		const httpResponse = await fetch("http://localhost:3000/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(createUser)
		});

		const response = await httpResponse.json();

		if (httpResponse.status != 201) {
			return { registeredSuccessfully: false, response };
		}

		return { registeredSuccessfully: true, response };
	}

	async login(email: string, password: string) {
		const loginUser = { email, password };

		const httpResponse = await fetch("http://localhost:3000/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(loginUser)
		});

		const response = await httpResponse.json();

		if (httpResponse.status != 201) {
			return { loggedSuccessfully: false, response };
		}
	
		return { loggedSuccessfully: true, response };
	}

	async loginWithIntra(): Promise<void> {
		const authorizeURL: string = import.meta.env.VITE_INTRA_API_AUTHORIZE_URL;
		const stateString: string = import.meta.env.VITE_STATE_STRING;
		if (authorizeURL)
			window.location.href = `${authorizeURL as string}&scope=public&state=${stateString}`;
		else
			console.log("INTRA_API_AUTHORIZE_URL environment variable unset");
	}

	onConnect(): void {
		this.socketId = this.socket?.id;
		friendsController.setEventHandlers();
		directMessageController.setEventsHandlers();
		channelController.setEventsHandlers();
		gameController.setEventHandlers();
	}

	onDisconnect(): void {
		this.socketId = undefined;
	}

	onAlreadyConnected(): void {
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

	checkIsLogged(): boolean {
		return this.isLogged;
	}

	logout(): void {
		this.onLogoutCallbacks.forEach((callback) => {
			callback();
		});
		localStorage.removeItem("token");
		this.token = null;
		this.socket?.disconnect();
		this.socket = null;
		this.isLogged = false;
	}

	addOnLogoutCallback(callback: Function): void {
		this.onLogoutCallbacks.push(callback);
	}

	async isTwoFactorAuthenticationEnabled(): Promise<boolean> {
		const httpResponse = await fetch('http://localhost:3000/2fa/is-enabled', {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${this.token}`
			}
		});
		if (httpResponse.status != 200) {
			return false;
		}
		const isEnabled = await httpResponse.json();
		return isEnabled;
	}

	async checkIfSecondFactorAuthenticationIsNeeded(access_token: string): Promise<boolean> {
		const decodedToken: JwtPayload = jwt_decode(access_token);
		const isTwoFactorAuthEnabled = await this.isTwoFactorAuthenticationEnabled();

		if (isTwoFactorAuthEnabled && !decodedToken.isSecondFactorAuthenticated)
			return true;
		return false;
	}

	async secondFactorAuthenticate(code: string): Promise<boolean> {
		if (!this.token)
			return false;

		const httpResponse = await fetch('http://localhost:3000/2fa/authenticate', {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({twoFactorAuthenticationCode: code})
		});
		if (httpResponse.status != 200) {
			return false;
		}
		const { access_token } = await httpResponse.json();
		await this.auth(access_token);
		return true;
	}
}

export const user = reactive<User>(new User);

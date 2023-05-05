import { reactive } from 'vue';
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import jwt_decode from "jwt-decode";
import { directMessageController } from './directMessageController';
import { channelController } from './channelController';
import { GameState, gameController } from './gameController';
import { friendsController } from './friendsController';
import type { JwtPayload, UserData, ReturnMessage } from './interfaces';
import { UserRole } from './interfaces/user-data.interface';
import { spectatorController } from './spectatorController';
import router from './router';

interface FetchedUser {
	id: number;
	username: string;
	elo: number;
	role: UserRole;
	isBanned: boolean;
}

class User {
	public token: string | null = null;
	public socket: Socket | null = null;
	public socketId: string | undefined;
	public alreadyConnected: boolean = false;
	public id: number = -1;
	public username: string = '';
	public avatarImageURL: string = '';
	public elo : number = 0;
	public role: UserRole = UserRole.USER;
	public isBannedFromWebsite: boolean = false;

	private isLogged: boolean = false;
	private onLogoutCallbacks: Function[] = [];

	async auth(access_token: string): Promise<ReturnMessage> {
		if (this.token && this.token === access_token)
			return { success: true };

		this.token = access_token;
		localStorage.setItem("token", access_token);
		try {
			const decoded: JwtPayload = jwt_decode(this.token);
			this.id = decoded.id;

			const userData: UserData | null = await this.fetchUserData();
			if (!userData) {
				return { success: false, message: "error fetching user data"};
			}

			const fetchedUser: FetchedUser = userData;
			this.username = fetchedUser.username;
			this.elo = fetchedUser.elo;
			this.avatarImageURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${this.id}`;
			this.role = fetchedUser.role;
			this.isBannedFromWebsite = fetchedUser.isBanned;

			if (this.isBannedFromWebsite) {
				this.logout();
				return { success: false, message: "user is banned from website"};
			}

		} catch (error) {
			return { success: false, message: "error from decoding token"};
		}

		const needSecondFactorAuth = await this.checkIfSecondFactorAuthenticationIsNeeded(this.token);
		if (!needSecondFactorAuth) {
			this.isLogged = true;

			if (!this.socket) {
				this.socket = io(`${import.meta.env.VITE_BACKEND_SOCKET_URL}`, {auth: {token: access_token}});
				this.socket.on("connect", () => { this.onConnect(); });
				this.socket.on("disconnect", () => { this.onDisconnect(); });
				this.socket.on("alreadyConnected", () => { this.onAlreadyConnected(); });
				this.socket.on("website-admin", () => { this.makeWebsiteAdmin(); });
				this.socket.on("remove-website-admin", () => { this.removeWebsiteAdmin(); });
				this.socket.on("banned-from-website", () => { this.banFromWebsite(); });
			}
		}

		return { success: true };
	}

	async register(username: string, email: string, password: string): Promise<ReturnMessage> {
		const createUser = { username, email, password };

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(createUser)
		});

		const response = await httpResponse.json();

		if (httpResponse.status != 201) {
			return { success: false, message: response.message };
		}

		return { success: true };
	}

	async login(email: string, password: string): Promise<ReturnMessage> {
		const loginUser = { email, password };

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(loginUser)
		});

		const response = await httpResponse.json();

		if (httpResponse.status != 201) {
			return { success: false, message: response.message };
		}	
	
		return { success: true, message: response.access_token };
	}

	async loginWithIntra(): Promise<void> {
		const authorizeURL: string = import.meta.env.VITE_INTRA_API_AUTHORIZE_URL;
		const stateString: string = import.meta.env.VITE_STATE_STRING;
		if (authorizeURL)
			window.location.href = `${authorizeURL as string}&scope=public&state=${stateString}`;
		else
			console.log("INTRA_API_AUTHORIZE_URL environment variable unset");
	}

	makeWebsiteAdmin() {
		this.role = UserRole.ADMIN;
	}

	removeWebsiteAdmin() {
		this.role = UserRole.USER;
		router.replace({ "name": "home" });
	}

	isWebsiteAdmin() {
		return this.role == UserRole.ADMIN || this.role == UserRole.OWNER;
	}

	isWebsiteOwner() {
		return this.role == UserRole.OWNER;
	}

	banFromWebsite() {
		this.isBannedFromWebsite = true;
		this.logout();
		router.replace({ "name": "login" });
	}

	onConnect(): void {
		this.socketId = this.socket?.id;
		friendsController.setEventHandlers();
		directMessageController.setEventsHandlers();
		channelController.setEventsHandlers();
		gameController.setEventHandlers();
		spectatorController.setEventHandlers();
	}

	onDisconnect(): void {
		this.socketId = undefined;
	}

	onAlreadyConnected(): void {
		this.alreadyConnected = true;
	}

	async validateToken(token: string): Promise<boolean> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/validate`, {
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

	hasSubmittedFirstTimeLoginForm(): boolean {
		if (this.username.length > 0)
			return true;
		return false;
	}

	logout(): void {
		this.onLogoutCallbacks.forEach((callback) => {
			callback();
		});
		localStorage.removeItem("token");
		this.token = null;
		this.socket?.disconnect();
		this.socket = null;
		this.id = -1;
		this.username = '';
		this.isLogged = false;
	}

	addOnLogoutCallback(callback: Function): void {
		this.onLogoutCallbacks.push(callback);
	}

	async isTwoFactorAuthenticationEnabled(): Promise<boolean> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/2fa/is-enabled`, {
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

	async secondFactorAuthenticate(code: string): Promise<ReturnMessage> {
		if (!this.token)
			return { success: false, message: "error while authenticating with 2FA: no token" };

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/2fa/authenticate`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({twoFactorAuthenticationCode: code})
		});
		if (httpResponse.status != 200) {
			return { success: false, message: "error while authenticating with 2FA" };
		}

		const { access_token } = await httpResponse.json();

		const authReturn: ReturnMessage = await this.auth(access_token);
		if (!authReturn.success) {
			return { success: false, message: `error while authenticating with 2FA: ${authReturn.message!}` };
		}
		return { success: true };
	}

	async turnOffTwoFactorAuth(): Promise<boolean> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/2fa/turn-off`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		});
		if (httpResponse.status != 200) {
			return false;
		}
		return true;
	}

	async turnOnTwoFactorAuth(code: string): Promise<boolean> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/2fa/turn-on`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${user.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({twoFactorAuthenticationCode: code})
		});
		if (httpResponse.status != 200) {
			return false;
		}
		return true;
	}

	async fetchUserData(): Promise<UserData | null> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${this.id}`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${this.token}`
			}
		});

		if (httpResponse.status != 200) {
			return null;
		}

		const response = await httpResponse.json();
		return response;
	}

	async updateUsername(newUsername: string): Promise<boolean> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${this.id}`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({username: newUsername})
		})

		if (httpResponse.status != 200) {
			return false;
		}
        this.username = newUsername;
		return true;
	}

	async updatePassword(newPassword: string): Promise<boolean> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${this.id}`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${this.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({password: newPassword})
		})

		if (httpResponse.status != 200) {
			return false;
		}
		return true;
	}

	async updateAvatar(image: Blob): Promise<boolean> {
		const formData: FormData = new FormData();
		formData.append("file", image, "file");
	
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/avatar/${user.id}`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.token}`,
			},
			body: formData
		});

		if (httpResponse.status != 201) {
			return false;
		}

		this.updateAvatarImageURL();
		return true;
	}

	updateAvatarImageURL(): void {
		let basicURL = this.avatarImageURL;
		const randomPartIndex = this.avatarImageURL.indexOf("?rand=");
		if (randomPartIndex != -1)
			basicURL = this.avatarImageURL.substring(0, randomPartIndex);

		const randomKey = +new Date();
		this.avatarImageURL = `${basicURL}?rand=${randomKey}`;
	}

	notifyOfUserChange(): void {
		this.socket?.emit("user-updated");
	}

	async deleteAccount(): Promise<ReturnMessage> {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${user.id}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${this.token}`,
			},
		});

		if (httpResponse.status != 200) {
			return { success: false, message: "error while deleting user"};
		}
		this.logout();

		return { success: true };
	}

	isGaming(): boolean {
		return (gameController.state != GameState.None
			&& gameController.state != GameState.End
		);
	}
}

export const user = reactive<User>(new User);

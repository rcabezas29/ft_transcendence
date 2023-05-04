import { reactive } from 'vue';
import { user } from './user';
import router from './router';

export interface OngoingGame {
	name: string;
	player1: string;
	player1Id: number;
	player1AvatarURL: string;
	player1Score: number;
	player2: string;
	player2Id: number;
	player2AvatarURL: string;
	player2Score: number;
}

class SpectatorController {

	public ongoingGames: OngoingGame[] = [];

	setEventHandlers() {
		user.socket?.on("ongoing-games", (games: OngoingGame[]) => { this.fetchOngoingGames(games) });
	}

	fetchOngoingGames(games: OngoingGame[]) {
		games.map(game => {
			game.player1AvatarURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${game.player1Id}`;
			game.player2AvatarURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${game.player2Id}`;
		})
		this.ongoingGames = games;
	}

	watchGame(gameName: string) {
		router.push({
			name: "spectate",
			params: { matchId: gameName }
		})
	}

	findGame(userId: number) {
		const game = this.ongoingGames.find((game) => {
			if (game.player1Id == userId || game.player2Id == userId) {
				return game;
			}
		});

		if (game) {
			this.watchGame(game.name);
		}
	}

	stopSpectating(matchId: string) {
		user.socket?.emit("spectate-leave", matchId);
	}
}

export const spectatorController = reactive<SpectatorController>(new SpectatorController);

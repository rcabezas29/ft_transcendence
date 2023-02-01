import { reactive } from "vue"; 
import { user } from './user';

enum GameState {
	None = "None",
	Searching = "Searching",
	Ready = "Ready",
	Playing = "Playing",
	End = "End"
}

class GameController {

	public adversaryName: string = "";
	public state: GameState = GameState.None;
	public gameState: number = 0;

	setEventHandlers(): void {
		user.socket?.on("game-found", (adversaryName: string) => { this.gameFound(adversaryName) });
		user.socket?.on("start-game", () => { this.startGame() });
		user.socket?.on("end-game", () => { this.endGame() });
		user.socket?.on("update-game", (gamePayload) => { this.updateGame(gamePayload) });
	}

	searchGame() {
		user.socket?.emit("search-game");
		this.state = GameState.Searching
	}

	gameFound(adversaryName: string) {
		this.adversaryName = adversaryName;
		this.state = GameState.Ready;
	}

	startGame() {
		this.state = GameState.Playing;
	}

	endGame() {
		this.state = GameState.End;
		this.gameState = 0;
	}

	updateGame(gamePayload: Date) {
		this.gameState = new Date(gamePayload).getTime();
	}

}

export const gameController = reactive<GameController>(new GameController());
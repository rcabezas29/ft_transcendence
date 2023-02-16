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
	public timestamp: number = 0;
	public gameRenderer : null | GameRenderer = null;

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
		this.adversaryName = adversaryName + "_matchmaking";
		this.state = GameState.Ready;
	}

	startGame() {
		this.state = GameState.Playing;
	}

	endGame() {
		this.state = GameState.End;
		this.timestamp = 0;
	}

	updateGame(gamePayload: any) {
		this.timestamp = new Date(gamePayload.moment).getTime();
		this.gameRenderer!.drawFrame(gamePayload);
	}

	initCanvas(canvasContext : CanvasRenderingContext2D) {
		this.gameRenderer = new GameRenderer(canvasContext);
	}
}

class GameRenderer {
	canvas : CanvasRenderingContext2D;

	constructor(canvas : CanvasRenderingContext2D) {
		this.canvas = canvas;
	}

	clearCanvas() {
		this.canvas.fillStyle = 'black';
		this.canvas.fillRect(0, 0, 400, 200);
	}

	drawFrame(payload : any) {
		this.clearCanvas();

		let ball : any = payload.ball;
		let	paddles : any = payload.paddles;
		this.canvas.fillStyle = 'white';
		this.canvas.fillText(`${payload.score[0]} - ${payload.score[1]}`, 200, 20);
		this.canvas.fillRect(ball.hitBox.position.x, ball.hitBox.position.y, 5, 5);
		paddles.forEach( (paddle : any) => {
			this.canvas.fillRect(paddle.hitBox.position.x, paddle.hitBox.position.y, paddle.hitBox.bounds.x, paddle.hitBox.bounds.y);
		});

	}
}


export const gameController = reactive<GameController>(new GameController());
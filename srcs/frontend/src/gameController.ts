import { reactive } from "vue";
import type {
  GameObject,
  Paddle,
  UpdateGamePayload,
} from "./interfaces/update-game.interface";
import { user } from "./user";

enum GameState {
  None = "None",
  Searching = "Searching",
  Ready = "Ready",
  Playing = "Playing",
  End = "End",
}

enum Moves {
  Up,
  Down,
}

//hardcoded for now
const MappedKeys: string[] = ["ArrowUp", "ArrowDown"];

const gameActions: any = {};

function up(pressed: boolean) {
  user.socket?.emit("move", Moves.Up, pressed);
}

function down(pressed: boolean) {
  user.socket?.emit("move", Moves.Down, pressed);
}

class GameController {
  public adversaryName: string = "";
  public state: GameState = GameState.None;
  public timestamp: number = 0;
  public gameRenderer: null | GameRenderer = null;

  setEventHandlers(): void {
    user.socket?.on("game-found", (adversaryName: string) => {
      this.gameFound(adversaryName);
    });
    user.socket?.on("start-game", () => {
      this.startGame();
    });
    user.socket?.on("end-game", (winner: boolean) => {
      this.endGame(winner);
    });
    user.socket?.on("update-game", (gamePayload) => {
      this.updateGame(gamePayload);
    });
  }

  searchGame() {
    user.socket?.emit("search-game");
    this.state = GameState.Searching;
  }

  gameFound(adversaryName: string) {
    this.adversaryName = adversaryName + "_matchmaking";
    this.state = GameState.Ready;
  }

  startGame() {
    this.state = GameState.Playing;
    gameActions[MappedKeys[Moves.Up]] = up;
    gameActions[MappedKeys[Moves.Down]] = down;
    window.addEventListener("keydown", (e) => {
      if (MappedKeys.includes(e.key)) {
        e.preventDefault();
        gameActions[e.key](true);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (MappedKeys.includes(e.key)) {
        e.preventDefault();
        gameActions[e.key](false);
      }
    });

  }

  endGame(win: boolean) {
    this.state = GameState.End;
    this.timestamp = 0;
    this.gameRenderer?.clearCanvas();
    if (win) {
      this.gameRenderer?.winGame();
    } else {
      this.gameRenderer?.loseGame();
    }
  }

  updateGame(gamePayload: UpdateGamePayload) {
    this.timestamp = new Date(gamePayload.currentTime).getTime();
    this.gameRenderer!.drawFrame(gamePayload);
  }

  initCanvas(canvasContext: CanvasRenderingContext2D) {
    this.gameRenderer = new GameRenderer(canvasContext);
  }

  checkPlayerContinuity() {
    user.socket?.emit('check-game-continuity', user.id);
  }
}

class GameRenderer {
  canvas: CanvasRenderingContext2D;

  constructor(canvas: CanvasRenderingContext2D) {
    this.canvas = canvas;
  }

  clearCanvas() {
    this.canvas.fillStyle = "black";
    this.canvas.fillRect(0, 0, 400, 200);
  }

  winGame() {
    this.canvas.fillStyle = "white";
    this.canvas.fillText(`WIN!!`, 200, 100);
  }

  loseGame() {
    this.canvas.fillStyle = "white";
    this.canvas.fillText(`LOSE :(`, 200, 100);
  }

  drawFrame(payload: UpdateGamePayload) {
    this.clearCanvas();

    const ball: GameObject = payload.ball;
    const paddles: Paddle[] = payload.paddles;
    this.canvas.fillStyle = "white";
    this.canvas.fillText(`${payload.score[0]} - ${payload.score[1]}`, 200, 20);
    this.canvas.fillRect(
      ball.hitBox.position.x,
      ball.hitBox.position.y,
      ball.hitBox.bounds.x,
      ball.hitBox.bounds.y
    );
    paddles.forEach((paddle: Paddle) => {
      this.canvas.fillRect(
        paddle.hitBox.position.x,
        paddle.hitBox.position.y,
        paddle.hitBox.bounds.x,
        paddle.hitBox.bounds.y
      );
    });
  }
}

export const gameController = reactive<GameController>(new GameController());

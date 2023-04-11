import { reactive } from "vue";
import type {
  GameObject,
  Paddle,
  UpdateGamePayload,
} from "./interfaces/update-game.interface";
import { user } from "./user";

export enum GameState {
  None,
  Searching,
  Ready,
  Playing,
  End,
}

enum Moves {
  Up,
  Down,
}

enum GameResult {
  Lose,
  Win,
  Draw,
}

enum GameSelection {
  Original,
  SuperCool,
  Crazy,
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
  public gameSelection : GameSelection = GameSelection.Original;

  setEventHandlers(): void {
    user.socket?.on("game-found", (adversaryName: string) => {
      this.gameFound(adversaryName);
    });
    user.socket?.on("start-game", () => {
      this.startGame();
    });
    user.socket?.on("end-game", (gameResult: GameResult) => {
      this.endGame(gameResult);
    });
    user.socket?.on("update-game", (gamePayload) => {
      this.updateGame(gamePayload);
    });
    user.socket?.on("rejoin-game", () => {
      this.startGame();
    });
  }

  searchGame() {
    user.socket?.emit("search-game", this.gameSelection);
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

  endGame(gameResult: GameResult) {
    this.state = GameState.End;
    this.timestamp = 0;
    this.gameRenderer?.clearCanvas();
    if (gameResult === GameResult.Win) {
      this.gameRenderer?.winGame();
    } else if (gameResult === GameResult.Lose) {
      this.gameRenderer?.loseGame();
    } else {
      this.gameRenderer?.tieGame();
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

  endGamePrematurely() {
    user.socket?.emit('end-game-prematurely');
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

  tieGame() {
    this.canvas.fillStyle = "white";
    this.canvas.fillText(`DRAW :|`, 200, 100);
  }

  drawFrame(payload: UpdateGamePayload) {
    this.clearCanvas();

    const balls: GameObject[] = payload.balls;
    const paddles: Paddle[] = payload.paddles;
    const powerups: GameObject[] = payload.powerups;
    this.canvas.fillStyle = "white";
    this.canvas.fillText(`${payload.score[0]} - ${payload.score[1]}`, 200, 20);
    balls.forEach((ball) => {
      this.canvas.fillRect(
        ball.hitBox.position.x,
        ball.hitBox.position.y,
        ball.hitBox.bounds.x,
        ball.hitBox.bounds.y
      );
    })
    paddles.forEach((paddle: Paddle) => {
      this.canvas.fillRect(
        paddle.hitBox.position.x,
        paddle.hitBox.position.y,
        paddle.hitBox.bounds.x,
        paddle.hitBox.bounds.y
      );
    });
    powerups.forEach((powerup: GameObject) => {
      this.canvas.globalAlpha = 0.2;
      this.canvas.fillRect(
        powerup.hitBox.position.x,
        powerup.hitBox.position.y,
        powerup.hitBox.bounds.x,
        powerup.hitBox.bounds.y
      );
      this.canvas.globalAlpha = 1.0;
    })
  }
}

export const gameController = reactive<GameController>(new GameController());

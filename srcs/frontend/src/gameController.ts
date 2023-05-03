import { reactive } from "vue";
import { GameSelection } from "./interfaces/game-selection";
import type {
  GameObject,
  Paddle,
  UpdateGamePayload,
  PowerUp,
} from "./interfaces/update-game.interface";
import type { Chat, ChatUser, UserData } from "./interfaces";
import { user } from "./user";
import { directMessageController } from "./directMessageController";

enum    PaddleColorSelection {
  Gray = "#D9D9D9",
  Orange = "#D64B24",
  Sky = "#45D7E7",
  Violet = "#8589EA",
  Pink = "#EC3F74",
  Burgundy = "#893168",
  Green = "#0A8754",
  Yellow = "#E7D352",
}

interface ScoreBoard {
  user1Name: string;
  user2Name: string;
  user1Score: number;
  user2Score: number;
}

interface PlayersUsernames {
  user1: string;
  user2: string;
}

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
  public paddleColor : PaddleColorSelection = PaddleColorSelection.Gray;
  public scoreBoard: ScoreBoard = {
    user1Name: "",
    user2Name: "",
    user1Score: 0,
    user2Score: 0,
  };
  
  setEventHandlers(): void {
    user.socket?.on("game-found", (adversaryName: string) => {
      this.gameFound(adversaryName);
    });
    user.socket?.on("start-game", (playersNames: PlayersUsernames) => {
      this.startGame(playersNames);
    });
    user.socket?.on("end-game", (gameResult: GameResult) => {
      this.endGame(gameResult);
    });
    user.socket?.on("update-game", (gamePayload) => {
        this.updateGame(gamePayload);
    });
    user.socket?.on("removed-from-queue", () => {
      this.state = GameState.None;
    });
    user.socket?.on("rejoin-game", (players : PlayersUsernames) => {
      this.scoreBoard.user1Name = players.user1;
      this.scoreBoard.user2Name = players.user2;
      this.startGame({
        user1: this.scoreBoard.user1Name,
        user2: this.scoreBoard.user2Name,
      });
    });
  }

  getScoreBoard() : ScoreBoard { return this.scoreBoard; }

  searchGame() {
    for (let friendId in directMessageController.chats) {
      const chat = directMessageController.chats[friendId];
      if (chat.challenge) {
        directMessageController.cancelChallenge((<ChatUser>chat.target).id);
      }
    }

    user.socket?.emit("search-game", {
      gameSelection: this.gameSelection,
      paddleColor : this.paddleColor,
    });
    this.state = GameState.Searching;
  }

  cancelSearch() {
    user.socket?.emit('cancel-search');
  }

  gameFound(adversaryName: string) {
    this.adversaryName = adversaryName + "_matchmaking";
    this.state = GameState.Ready;
  }

  startGame(playersNames: PlayersUsernames) {
    this.state = GameState.Playing;
    this.scoreBoard.user1Name = playersNames.user1;
    this.scoreBoard.user2Name = playersNames.user2;
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
    let result : string = "";
    if (gameResult === GameResult.Win) {
      result = "win";
    } else if (gameResult === GameResult.Lose) {
      result = "lose";
    } else {
      result = "draw";
    }
    this.gameRenderer?.gameEnding(result);

    this.updateUserElo();
  }

  updateGame(gamePayload: UpdateGamePayload) {
    this.timestamp = new Date(gamePayload.currentTime).getTime();
    this.scoreBoard.user1Score = gamePayload.score[0];
    this.scoreBoard.user2Score = gamePayload.score[1];
    this.gameRenderer?.drawFrame(gamePayload);
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

  private updateUserElo() {
    user.fetchUserData().then((userData: UserData | null) => {
      if (!userData) {
        console.log('error fetching user data on game end');
        return ;
      }
      user.elo = userData.elo;
    });
  }
}

class GameRenderer {
  canvas: CanvasRenderingContext2D;

  constructor(canvas: CanvasRenderingContext2D) {
    this.canvas = canvas;
  }

  clearCanvas() {
    this.canvas.clearRect(0, 0, 800, 400);
  }

  gameEnding(result : string) {
    this.canvas.textAlign = "center";
    this.canvas.font = "30px vp-pixel";
    this.canvas.fillStyle = "white";
    this.canvas.fillText(`GAME OVER`, 400, 150);
    this.canvas.font = "20px vp-pixel";
    if (result === 'win') {
      this.winGame();
    } else if (result === 'lose') {
      this.loseGame();
    } else if (result === 'draw') {
      this.tieGame();
    }
  }

  endGameForSpectator(winner : string) {
    this.clearCanvas();
    this.canvas.textAlign = "center";
    this.canvas.font = "30px vp-pixel";
    this.canvas.fillStyle = "white";
    if (winner === "") {
      this.canvas.fillText(`DRAW`, 400, 250);
    } else {
      this.canvas.fillText(`WINNER : ${winner}`, 400, 250);
    }
  }

  winGame() {
    this.canvas.fillText(`YOU WIN :)`, 400, 250);
  }

  loseGame() {
    this.canvas.fillText(`YOU LOSE :(`, 400, 250);
  }

  tieGame() {
    this.canvas.fillText(`DRAW :|`, 400, 250);
  }

  drawFrame(payload: UpdateGamePayload) {
    this.clearCanvas();

    const balls: GameObject[] = payload.balls;
    const paddles: Paddle[] = payload.paddles;
    const powerups: PowerUp[] = payload.powerups;
    this.canvas.fillStyle = "#D9D9D9";
    balls.forEach((ball) => {
      this.canvas.fillRect(
        ball.hitBox.position.x,
        ball.hitBox.position.y,
        ball.hitBox.bounds.x,
        ball.hitBox.bounds.y
        );
    });
      paddles.forEach((paddle: Paddle) => {
      this.canvas.fillStyle = paddle.color;
      this.canvas.fillRect(
        paddle.hitBox.position.x,
        paddle.hitBox.position.y,
        paddle.hitBox.bounds.x,
        paddle.hitBox.bounds.y
      );
    });

	if (powerups) {
		powerups.forEach((powerup: PowerUp) => {
			this.canvas.globalAlpha = 0.2;
      if (powerup.type == 0) {
        this.canvas.fillStyle = "#E7D352";
      } else if (powerup.type == 1) {
        this.canvas.fillStyle = "#D64B24";
      } else if (powerup.type == 2) {
        this.canvas.fillStyle = "#45D7E7";
      } else if (powerup.type == 3) {
        this.canvas.fillStyle = "#0A8754";
      }

			this.canvas.fillRect(
				powerup.hitBox.position.x,
				powerup.hitBox.position.y,
				powerup.hitBox.bounds.x,
				powerup.hitBox.bounds.y
			);
      this.canvas.fillStyle = "black";
      this.canvas.font = "30px sans-serif";
      this.canvas.fillText(`?`, powerup.hitBox.position.x + powerup.hitBox.bounds.x / 3, powerup.hitBox.position.y + powerup.hitBox.bounds.y - (powerup.hitBox.bounds.y / 4));
			this.canvas.globalAlpha = 1.0;
      this.canvas.font = "10px sans-serif";
		})
	}
   
  }
}

export const gameController = reactive<GameController>(new GameController());

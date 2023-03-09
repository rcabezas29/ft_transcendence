import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { Vector2 } from './classes/vector2';
import { GameObject, Paddle } from './classes/game-object';
import { Table } from './classes/table';

const FPS = 60;
const FRAME_TIME = 1 / FPS;

const INITIAL_BALL_SPEED = 5; // in px per second;

type Move = (playerIndex: number, deltaTime: number) => void;
type gameAction = { move: Move; input: boolean };

enum Moves {
  Up,
  Down,
}

enum GameStatus {
  Preparing = 'preparing',
  Playing = 'playing',
  End = 'end',
}

class Game {
  name: string;
  players: GatewayUser[] = [];
  playerActions: gameAction[][] = [];
  viwers: GatewayUser[] = [];
  status: GameStatus;
  startDate: Date;
  gameInterval: NodeJS.Timer;
  server: Server;

  score: number[];
  ball: GameObject;
  paddles: Paddle[];
  table: Table;

  movements: Move[] = [];

  constructor(
    player1: GatewayUser,
    player2: GatewayUser,
    server: Server,
    private usersService: UsersService,
    private matchHistoryService: MatchHistoryService
  ) {
    this.server = server;
    this.players.push(player1);
    this.players.push(player2);
    this.status = GameStatus.Preparing;
    this.name = this.players[0].username + '_game_' + this.players[1].username;
    this.table = new Table();
    this.score = [0, 0];

    this.movements.push((playerIndex: number, deltaTime: number) => {
      this.paddles[playerIndex].moveUp(deltaTime);
    });
    this.movements.push((playerIndex: number, deltaTime: number) => {
      this.paddles[playerIndex].moveDown(deltaTime);
    });

    this.playerActions.push([
      { move: this.movements[0], input: false },
      { move: this.movements[1], input: false },
    ]);

    this.playerActions.push([
      { move: this.movements[0], input: false },
      { move: this.movements[1], input: false },
    ]);

    for (const i in this.players) {
      this.players[i].socket.join(this.name);
    }

    this.startDate = new Date();
    this.start();
  }

  start() {
    this.ball = new GameObject(
      new Vector2(200, 100),
      new Vector2(0, 0),
      new Vector2(5, 5),
      INITIAL_BALL_SPEED,
    );
    this.serveBall(Math.floor(Math.random() * 2));
    this.instancePaddles();
    this.status = GameStatus.Playing;
    this.server.to(this.name).emit('start-game');
    this.players.forEach((player, playerIndex) => {
      player.socket.on('disconnect', () => {
        this.end((playerIndex + 1) % 2);
      });
      player.socket.on('move', (movementIndex: number, pressed: boolean) => {
        this.playerActions[playerIndex][movementIndex].input = pressed;
      });
    });

    this.gameInterval = setInterval(() => {
      this.gameLoop();
    }, FRAME_TIME * 1000);
  }

  gameLoop() {
    const now = new Date();

    if (now.getTime() - this.startDate.getTime() >= 200 * 1000) {
      this.end(Number(this.score[1] > this.score[0]));
    }
    this.updateObjects(now);
    const payload = {
      paddles: this.paddles,
      score: this.score,
      ball: this.ball,
      currentTime: now,
    };
    this.server.to(this.name).emit('update-game', payload);
  }

  private previousFrameTime_: number;

  updateObjects(now: Date) {
    //deltaTime is in seconds !
    const deltaTime: number = (now.getTime() - this.previousFrameTime_) / 1000;
    this.previousFrameTime_ = now.getTime();

    for (
      let playerIndex = 0;
      playerIndex < this.playerActions.length;
      ++playerIndex
    ) {
      for (let moveIndex = 0; moveIndex < 2; ++moveIndex) {
        if (this.playerActions[playerIndex][moveIndex].input === true) {
          this.playerActions[playerIndex][moveIndex].move(
            playerIndex,
            deltaTime,
          );
        }
      }
    }
    this.paddles.forEach((paddle) => {
      if (paddle.hitBox.overlaps(this.ball.hitBox)) {
        this.ball.direction = paddle.bounceBall(this.ball);
      }
    });
    this.table.walls.forEach((wall) => {
      if (wall.overlaps(this.ball.hitBox)) {
        this.ball.direction = this.table.reflect(
          this.ball.direction,
          wall.orientation,
        );
      }
    });
    this.table.goals.forEach((goal, index) => {
      if (goal.overlaps(this.ball.hitBox)) {
        this.computeGoal(index);
      }
    });
    this.ball.updatePosition(deltaTime);
  }

  instancePaddles() {
    this.paddles = [];
    this.paddles[0] = new Paddle(
      new Vector2(40, 100),
      this.table.goals[0].orientation,
      20,
      this.table.area,
    );
    this.paddles[1] = new Paddle(
      new Vector2(400 - 40, 100),
      this.table.goals[1].orientation,
      20,
      this.table.area,
    );
  }

  computeGoal(receiver: number) {
    this.score[(receiver + 1) % 2] += 1;
    this.serveBall(receiver);
    if (this.score[0] === 7 || this.score[1] === 7) {
      this.end(Number(this.score[1] === 7));
    }
  }

  serveBall(ballServer: number) {
    this.ball.hitBox.position.x = 200;
    this.ball.hitBox.position.y = 100;
    this.ball.speed = 1;

    this.ball.direction = new Vector2(
      this.table.goals[0].orientation.x * (1 - 2 * ballServer),
      this.table.goals[0].orientation.y * (1 - 2 * ballServer),
    );
  }

  end(winnerIndex: number) {
    clearInterval(this.gameInterval);
    console.log('game end', this.name);
    this.status = GameStatus.End;

    const expectedScore: number =
      1 / ((1 + 10) ^ ((this.players[1].elo - this.players[0].elo) / 400));

    this.players.forEach((player, index) => {
      player.socket.emit('end-game', index === winnerIndex);
      player.elo = Math.floor(
        player.elo + 32 * (Number(index === winnerIndex) - expectedScore),
      );
      this.usersService.update(player.id, { elo: player.elo });
      this.usersService.updateStats(player.id, {
        winner: index === winnerIndex,
        scoredGoals: this.score[index],
        receivedGoals: this.score[(index + 1) % 2],
      });
    });
    this.matchHistoryService.create({
      user1Id: this.players[0].id,
      user2Id: this.players[1].id,
      winner: this.players[winnerIndex].id,
      score: this.score,
    });
    this.players.forEach((player) => player.socket.leave(this.name));
  }

  sendToPlayer(player: GatewayUser, signal: string, body: any) {
    player.socket.emit(signal, body);
  }
}

@Injectable()
export class GameService {
  public server: Server;

  constructor(private usersService: UsersService, private matchHistoryService: MatchHistoryService, private gatewayManagerService: GatewayManagerService) {}

  createGame(user1: GatewayUser, user2: GatewayUser) {
    new Game(user1, user2, this.server, this.usersService, this.matchHistoryService);
    this.notifyFriends(user1, user2);
  }

  async notifyFriends(user1: GatewayUser, user2: GatewayUser) {
    let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(user1.id);
		friends.forEach(friend => {
			friend.socket.emit('friend-in-a-game', user1.id);
		});

    friends = await this.gatewayManagerService.getAllUserConnectedFriends(user2.id);
    friends.forEach(friend => {
			friend.socket.emit('friend-in-a-game', user2.id);
		});
  }
}

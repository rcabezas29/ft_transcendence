import { Server } from 'socket.io';
import { GatewayUser } from "src/gateway-manager/interfaces";
import { Vector2 } from './classes/vector2';
import { GameObject, Paddle } from './classes/game-object';
import { Table } from './classes/table';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { Player, GameResult } from './interfaces';
import { Stats } from 'src/stats/entities/stats.entity';
import { UpdateStatsDto } from 'src/stats/dto/update-stats.dto';

const FPS = 60;
const FRAME_TIME = 1 / FPS;
const INITIAL_BALL_SPEED = 100;
const WIN_SCORE = 1;
const GAME_DURATION = 200; // in seconds (?)

// TODO: calculate from game-canvas size
const BALL_START_POSITION_X = 200;
const BALL_START_POSITION_Y = 100;

type Move = (playerIndex: number, deltaTime: number) => void;
type gameAction = { move: Move; input: boolean };

export default class Game {
    name: string;
    players: Player[] = [];
    playerActions: gameAction[][] = [];
    viwers: GatewayUser[] = [];
    startDate: Date;
    gameInterval: NodeJS.Timer;
    server: Server;

    ball: GameObject;
    paddles: Paddle[];
    table: Table;
    
    movements: Move[] = [];
	endGameCallbacks: Function[] = []
	startGameCallbacks: Function[] = []
    
    constructor(
        player1: GatewayUser,
        player2: GatewayUser,
        server: Server,
        private usersService: UsersService,
        private matchHistoryService: MatchHistoryService,
        private gatewayManagerService: GatewayManagerService
    ) {
        this.server = server;

        const player1interface: Player = {
            user: player1,
            score: 0,
            result: GameResult.Draw,
        }
        const player2interface: Player = {
            user: player2,
            score: 0,
            result: GameResult.Draw,
        }
        this.players.push(player1interface);
        this.players.push(player2interface);

        this.name = this.players[0].user.username + '_game_' + this.players[1].user.username;
        this.table = new Table();
        
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
            this.players[i].user.socket.join(this.name);
        }

        this.startDate = new Date();

        this.setStartGameCallback(() => this.notifyNewGameToAllUsers());

        this.setEndGameCallback(() => this.notifyEndGameToAllUsers());
        this.setEndGameCallback(() => this.createMatchHistory());
        this.setEndGameCallback(() => this.removePlayersFromGameChannel());
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
        this.server.to(this.name).emit('start-game');
        this.players.forEach((player, playerIndex) => {
            player.user.socket.on('move', (movementIndex: number, pressed: boolean) => {
                this.playerActions[playerIndex][movementIndex].input = pressed;
            });
        });

        this.callStartGameCallbacks();

        this.gameInterval = setInterval(() => {
            this.gameLoop();
        }, FRAME_TIME * 1000);
        
        this.gatewayManagerService.setGatewayUserGamingStatus(this.players[0].user.id);
        this.gatewayManagerService.setGatewayUserGamingStatus(this.players[1].user.id);

    }

	private checkGameTimeIsOver(currentTime: Date): boolean {
		return currentTime.getTime() - this.startDate.getTime() >= GAME_DURATION * 1000;
	}

    private checkIfMaxScoreWasReached(): boolean {
		return (this.players[0].score === WIN_SCORE || this.players[1].score === WIN_SCORE);
	}

    private gameLoop() {
        const now = new Date();
        
        if (this.checkGameTimeIsOver(now) || this.checkIfMaxScoreWasReached()) {
            this.end();
        }

        this.updateObjects(now);
        const payload = {
            paddles: this.paddles,
            score: [this.players[0].score, this.players[1].score],
            ball: this.ball,
            currentTime: now,
        };
        this.server.to(this.name).emit('update-game', payload);
    }

    private previousFrameTime_: number = null;
        
    private updateObjects(now: Date) {
        //deltaTime is in seconds !
        let deltaTime: number = 0;
        if (this.previousFrameTime_ != null) {
            deltaTime = (now.getTime() - this.previousFrameTime_) / 1000;
        }
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
                if (this.ball.speed < 450) {
                    this.ball.speed *= 1.1;
                }
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
				this.serveBall(index);
            }
        });
        this.ball.updatePosition(deltaTime);
    }
                
    private instancePaddles() {
        this.paddles = [];
        this.paddles[0] = new Paddle(
            new Vector2(40, 100),
            this.table.goals[0].orientation,
            30,
            this.table.area,
        );
        this.paddles[1] = new Paddle(
            new Vector2(400 - 40, 100),
            this.table.goals[1].orientation,
            30,
            this.table.area,
        );
    }
    
    private computeGoal(receiver: number) {
        this.players[(receiver + 1) % 2].score += 1;
    }
    
    private serveBall(ballServer: number) {
        this.ball.hitBox.position.x = BALL_START_POSITION_X;
        this.ball.hitBox.position.y = BALL_START_POSITION_Y;
        this.ball.speed = INITIAL_BALL_SPEED;
        
        this.ball.direction = new Vector2(
            this.table.goals[0].orientation.x * (1 - 2 * ballServer),
            this.table.goals[0].orientation.y * (1 - 2 * ballServer),
        );
    }

    private createMatchHistory(): void {
        const matchHistory = {
            user1Id: this.players[0].user.id,
            user2Id: this.players[1].user.id,
            winner: null,
            loser: null,
            score: [this.players[0].score, this.players[1].score],
        }

        this.players.forEach(async (player, index) => {
            if (player.result === GameResult.Win) {
                matchHistory.winner = index;
            } else if (player.result === GameResult.Lose) {
                matchHistory.loser = index;
            }
        });
    
        this.matchHistoryService.create(matchHistory);
    }

    private calculateUserElo(user: GatewayUser, other: GatewayUser, userGameResult: GameResult): number {
		const expectedScore = 1 / (1 + 10 ^ ((user.elo - other.elo) / 400));
		const eloScalar = 32;
		const eloModifier = userGameResult === GameResult.Win ? 1 : 0;
		const elo = user.elo + eloScalar * (eloModifier - expectedScore);
		return elo;
	}

    private updateUserElo(player: Player, otherPlayer: Player): void {
        const elo: number = Math.floor(this.calculateUserElo(player.user, otherPlayer.user, player.result));
        player.user.elo = elo;
        this.usersService.update(player.user.id, { elo });
    }

    private resolvePlayersGameResultFromScore(): void {
        this.players.forEach(async (player, index) => {
            const otherPlayer: Player = this.players[(index + 1) % 2];

            if (player.score > otherPlayer.score) {
                player.result = GameResult.Win;
            } else if (player.score < otherPlayer.score) {
                player.result = GameResult.Lose;
            } else {
                player.result = GameResult.Draw;
            }
        });
    }

    private async updateUserStats(player: Player, otherPlayer: Player): Promise<void> {
        const userStats: Stats = await this.usersService.getUserStats(player.user.id);
        const statsToUpdate: UpdateStatsDto = {
            scoredGoals: userStats.scoredGoals += player.score,
            receivedGoals: userStats.receivedGoals += otherPlayer.score
        }
        if (player.result === GameResult.Win)
            statsToUpdate.wonGames = userStats.wonGames += 1;
        else if (player.result === GameResult.Lose)
            statsToUpdate.lostGames = userStats.lostGames += 1;
        else
            statsToUpdate.drawGames = userStats.drawGames += 1;

        this.usersService.updateStats(player.user.id, statsToUpdate);
    }

    private removePlayersFromGameChannel(): void {
        this.players.forEach((player) => player.user.socket.leave(this.name));
    }

    // If one of the players ended the game by hand (prematurely),
    // the function will set the game ender as loser
    end(gameEnderIndex: number = -1) {
		clearInterval(this.gameInterval);

        if (gameEnderIndex != -1) {
            console.log(`player {${gameEnderIndex}} ended the game {${this.name}} prematurely`);
            this.players[gameEnderIndex].result = GameResult.Lose;
            this.players[gameEnderIndex == 0 ? 1 : 0].result = GameResult.Win;
        } else {
            console.log('game end', this.name);
            this.resolvePlayersGameResultFromScore();
        }

        this.players.forEach(async (player, index) => {
            const otherPlayer: Player = this.players[(index + 1) % 2];
  
            player.user.socket.emit('end-game', player.result);

            if (player.result !== GameResult.Draw) {
                this.updateUserElo(player, otherPlayer);
            }

            this.updateUserStats(player, otherPlayer);
            this.gatewayManagerService.unsetGatewayUserGamingStatus(player.user.id);
        });

        this.callEndGameCallbacks();
    }
    
    rejoinPlayer(player: GatewayUser) {
        for (const i in this.players) {
            if (this.players[i].user.socket.connected === false)
            this.players[i].user.socket = player.socket;
            this.players[i].user.socket.join(this.name);
            this.players[i].user.socket.on('move', (movementIndex: number, pressed: boolean) => {
                this.playerActions[i][movementIndex].input = pressed;
            });
        }
        this.gatewayManagerService.setGatewayUserGamingStatus(player.id);
    }

	setEndGameCallback(fn: Function) {
		this.endGameCallbacks.push(fn);
	}

	callEndGameCallbacks() {
		this.endGameCallbacks.forEach(fn => {
			fn(this.name)
		});
	}

    setStartGameCallback(fn: Function) {
		this.startGameCallbacks.push(fn);
	}

	callStartGameCallbacks() {
		this.startGameCallbacks.forEach(fn => {
			fn(this.name)
		});
	}

	private notifyNewGameToAllUsers() {
		const game = {
			"name": this.name,
			"player1": this.players[0].user.username,
			"player2": this.players[1].user.username
		}
	
		this.server.emit("spectator-new-game", game);
	}

	private notifyEndGameToAllUsers() {
		this.server.to(this.name).emit("spectator-end-game", this.name);
	}
}

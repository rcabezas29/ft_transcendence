import { Server } from 'socket.io';
import { GatewayUser } from "src/gateway-manager/interfaces";
import { Vector2 } from './vector2';
import { GameObject, Paddle } from './game-object';
import { Table } from './table';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { Player, GameResult } from '../interfaces';
import { Stats } from 'src/stats/entities/stats.entity';
import { UpdateStatsDto } from 'src/stats/dto/update-stats.dto';

const FPS = 60;
const FRAME_TIME = 1 / FPS;
const INITIAL_BALL_SPEED = 200;
const WIN_SCORE = 7;
const GAME_DURATION = 200; // in seconds (?)

// TODO: calculate from game-canvas size
const BALL_START_POSITION_X = 400;
const BALL_START_POSITION_Y = 200;

const MAX_BALL_SPEED = 700;

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
    winner: string = "";

    ball: GameObject;
    paddles: Paddle[];
    paddleColors: string[] = [];
    table: Table;
    
    movements: Move[] = [];
	endGameCallbacks: Function[] = []
	startGameCallbacks: Function[] = []
    
    constructor(
        player1: GatewayUser,
        player2: GatewayUser,
        server: Server,
        protected usersService: UsersService,
        protected matchHistoryService: MatchHistoryService,
        protected gatewayManagerService: GatewayManagerService
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

        this.paddleColors.push(player1.color);
        this.paddleColors.push(player2.color);

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
            new Vector2(400, 200),
            new Vector2(0, 0),
            new Vector2(10, 10),
            INITIAL_BALL_SPEED,
        );
        this.serveBall(Math.floor(Math.random() * 2));
        this.instancePaddles();
        this.server.to(this.name).emit('start-game', {
            user1: this.players[0].user.username,
            user2: this.players[1].user.username,
        });
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

	protected checkGameTimeIsOver(currentTime: Date): boolean {
		return currentTime.getTime() - this.startDate.getTime() >= GAME_DURATION * 1000;
	}

    protected checkIfMaxScoreWasReached(): boolean {
		return (this.players[0].score === WIN_SCORE || this.players[1].score === WIN_SCORE);
	}

    protected gameLoop() {
        const now = new Date();
        
        if (this.checkGameTimeIsOver(now) || this.checkIfMaxScoreWasReached()) {
            this.end();
        }
        this.updateObjects(now);
        const payload = {
            paddles: this.paddles,
            score: [this.players[0].score, this.players[1].score],
            balls: [this.ball],
            currentTime: now,
        };
        this.server.to(this.name).emit('update-game', payload);
    }

    protected previousFrameTime_: number = null;
        
    protected updateObjects(now: Date) {
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
                if (this.ball.speed < MAX_BALL_SPEED) {
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
                this.ball.hitBox.position.y <= 0 ?
                    this.ball.hitBox.position.y = 0 :
                    this.ball.hitBox.position.y = 400 - this.ball.hitBox.bounds.y;
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
                
    protected instancePaddles() {
        this.paddles = [];
        this.paddles[0] = new Paddle(
            new Vector2(80, 200),
            this.table.goals[0].orientation,
            60,
            this.table.area,
            this.paddleColors[0],
        );
        this.paddles[1] = new Paddle(
            new Vector2(800 - 80, 200),
            this.table.goals[1].orientation,
            60,
            this.table.area,
            this.paddleColors[1],
        );
    }
    
    protected computeGoal(receiver: number) {
        this.players[(receiver + 1) % 2].score += 1;
    }
    
    protected serveBall(ballServer: number) {
        this.ball.hitBox.position.x = BALL_START_POSITION_X;
        this.ball.hitBox.position.y = BALL_START_POSITION_Y;
        this.ball.speed = INITIAL_BALL_SPEED;
        
        this.ball.direction = new Vector2(
            this.table.goals[0].orientation.x * (1 - 2 * ballServer),
            this.table.goals[0].orientation.y * (1 - 2 * ballServer),
        );
    }

    protected createMatchHistory(): void {
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

    protected calculateUserElo(user: GatewayUser, other: GatewayUser, userGameResult: GameResult): number {
		const expectedScore = 1 / (1 + 10 ^ ((user.elo - other.elo) / 400));
		const eloScalar = 32;
		const eloModifier = userGameResult === GameResult.Win ? 1 : 0;
		const elo = user.elo + eloScalar * (eloModifier - expectedScore);
		return elo;
	}

    protected updateUserElo(player: Player, otherPlayer: Player): void {
        const elo: number = Math.floor(this.calculateUserElo(player.user, otherPlayer.user, player.result));
        player.user.elo = elo;
        this.usersService.update(player.user.id, { elo });
    }

    protected resolvePlayersGameResultFromScore(): void {
        this.players.forEach(async (player, index) => {
            const otherPlayer: Player = this.players[(index + 1) % 2];

            if (player.score > otherPlayer.score) {
                player.result = GameResult.Win;
                this.winner = player.user.username;
            } else if (player.score < otherPlayer.score) {
                player.result = GameResult.Lose;
                this.winner = otherPlayer.user.username;
            } else {
                player.result = GameResult.Draw;
            }
        });
    }

    protected async updateUserStats(player: Player, otherPlayer: Player): Promise<void> {
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

    protected removePlayersFromGameChannel(): void {
        this.players.forEach((player) => player.user.socket.leave(this.name));
        this.viwers.forEach((viwer) => {viwer.socket.leave(this.name)});
    }

    // If one of the players ended the game by hand (prematurely),
    // the function will set the game ender as loser
    end(gameEnderIndex: number = -1) {
        clearInterval(this.gameInterval);
        
        if (gameEnderIndex != -1) {
            console.log(`player {${gameEnderIndex}} ended the game {${this.name}} prematurely`);
            this.winner =  this.players[gameEnderIndex == 0 ? 1 : 0].user.username;
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

	protected notifyNewGameToAllUsers() {
		const game = {
			"name": this.name,
			"player1": this.players[0].user.username,
			"player2": this.players[1].user.username
		}
	
		this.server.emit("spectator-new-game", game);
	}

	protected notifyEndGameToAllUsers() {
		this.server.to(this.name).emit("spectator-end-game", this.winner);
	}
}

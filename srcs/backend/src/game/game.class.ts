import { Server } from 'socket.io';
import { GatewayUser } from "src/gateway-manager/interfaces";
import { Vector2 } from './classes/vector2';
import { GameObject, Paddle } from './classes/game-object';
import { Table } from './classes/table';
import { GameResult } from 'src/users/interfaces/game-info.interface';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { Player } from './interfaces/player.interface';

const FPS = 60;
const FRAME_TIME = 1 / FPS;
const INITIAL_BALL_SPEED = 100;
const WIN_SCORE = 1;
const GAME_DURATION = 10; // in seconds (?)

// TODO: calculate from game-canvas size
const BALL_START_POSITION_X = 200;
const BALL_START_POSITION_Y = 100;

type Move = (playerIndex: number, deltaTime: number) => void;
type gameAction = { move: Move; input: boolean };

export enum GameStatus {
    Preparing,
    Playing,
    End,
}

export default class Game {
    name: string;
    players: Player[] = [];
    playerActions: gameAction[][] = [];
    viwers: GatewayUser[] = [];
    status: GameStatus;
    startDate: Date;
    gameInterval: NodeJS.Timer;
    server: Server;

    ball: GameObject;
    paddles: Paddle[];
    table: Table;
    
    movements: Move[] = [];
	endGameCallbacks: Function[] = []
    
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

        this.status = GameStatus.Preparing;
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
            player.user.socket.on('move', (movementIndex: number, pressed: boolean) => {
                this.playerActions[playerIndex][movementIndex].input = pressed;
            });
        });
        
        this.gameInterval = setInterval(() => {
            this.gameLoop();
        }, FRAME_TIME * 1000);
        
        this.notifyFriendsOfGameStart();
        this.gatewayManagerService.setGatewayUserGamingStatus(this.players[0].user.id);
        this.gatewayManagerService.setGatewayUserGamingStatus(this.players[1].user.id);
		this.notifyNewGameToAllUsers();
    }

	checkGameTimeIsOver(currentTime: Date): boolean {
		return currentTime.getTime() - this.startDate.getTime() >= GAME_DURATION * 1000;
	}

    gameLoop() {
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
    
	checkIfMaxScoreWasReached(): boolean {
		return (this.players[0].score === WIN_SCORE || this.players[1].score === WIN_SCORE);
	}

    private previousFrameTime_: number = null;
        
    updateObjects(now: Date) {
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
                
    instancePaddles() {
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
    
    computeGoal(receiver: number) {
        this.players[(receiver + 1) % 2].score += 1;
    }
    
    serveBall(ballServer: number) {
        this.ball.hitBox.position.x = BALL_START_POSITION_X;
        this.ball.hitBox.position.y = BALL_START_POSITION_Y;
        this.ball.speed = INITIAL_BALL_SPEED;
        
        this.ball.direction = new Vector2(
            this.table.goals[0].orientation.x * (1 - 2 * ballServer),
            this.table.goals[0].orientation.y * (1 - 2 * ballServer),
        );
    }

	calculateUserElo(user: GatewayUser, other: GatewayUser, userGameResult: GameResult): number {
		const expectedScore = 1 / (1 + 10 ^ ((user.elo - other.elo) / 400));
		const eloScalar = 32;
		const eloModifier = userGameResult === GameResult.Win ? 1 : 0;
		const elo = user.elo + eloScalar * (eloModifier - expectedScore);
		return elo;
	}

    end() {
		clearInterval(this.gameInterval);
        console.log('game end', this.name);
        this.status = GameStatus.End; //FIXME: ????

        const matchHistory = {
            user1Id: this.players[0].user.id,
            user2Id: this.players[1].user.id,
            winner: null,
            loser: null,
            score: [this.players[0].score, this.players[1].score],
        }

        this.players.forEach((player, index) => {
            const otherPlayer: Player = this.players[(index + 1) % 2];

            if (player.score > otherPlayer.score) {
                player.result = GameResult.Win;
                matchHistory.winner = index;
            } else if (player.score < otherPlayer.score) {
                player.result = GameResult.Lose;
                matchHistory.loser = index;
            } else {
                player.result = GameResult.Draw;
            }

            player.user.socket.emit('end-game', player.result);

            if (player.score !== otherPlayer.score) {
                const elo: number = Math.floor(this.calculateUserElo(player.user, otherPlayer.user, player.result));
                player.user.elo = elo;
                this.usersService.update(player.user.id, { elo });
            }

            this.usersService.updateStats(player.user.id, {
                gameResult: player.result,
                scoredGoals: player.score,
                receivedGoals: otherPlayer.score
            });

            this.gatewayManagerService.unsetGatewayUserGamingStatus(player.user.id);
        });

        this.matchHistoryService.create(matchHistory);
        
        this.removePlayersFromGameChannel();
        this.notifyFriendsOfGameEnd();

		this.callEndGameCallbacks();
		this.notifyEndGameToAllUsers();
    }

    removePlayersFromGameChannel(): void {
        this.players.forEach((player) => player.user.socket.leave(this.name));
    }
    
    sendToPlayer(player: GatewayUser, signal: string, body: any) {
        player.socket.emit(signal, body);
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
    

	//TODO: maybe this could be moved to game.service
    async notifyFriendsOfGameStart() {
        let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[0].user.id);
        friends.forEach(friend => {
            friend.socket.emit('friend-in-a-game', this.players[0].user.id);
        });
        
        friends = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[1].user.id);
        friends.forEach(friend => {
            friend.socket.emit('friend-in-a-game', this.players[1].user.id);
        });
    }
    
	//TODO: maybe this could be moved to game.service
    async notifyFriendsOfGameEnd() {
        let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[0].user.id);
        friends.forEach(friend => {
            friend.socket.emit('friend-game-ended', this.players[0].user.id);
        });
        
        friends = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[1].user.id);
        friends.forEach(friend => {
            friend.socket.emit('friend-game-ended', this.players[1].user.id);
        });
    }

	setEndGameCallback(fn: Function) {
		this.endGameCallbacks.push(fn)
	}
	
	callEndGameCallbacks() {
		this.endGameCallbacks.forEach(fn => {
			fn(this.name)
		})
	}

	//TODO: create a start game callback array
	notifyNewGameToAllUsers() {
		const game = {
			"name": this.name,
			"player1": this.players[0].user.username,
			"player2": this.players[1].user.username
		}
	
		this.server.emit("spectator-new-game", game);
	}
	
	notifyEndGameToAllUsers() {
		this.server.to(this.name).emit("spectator-end-game", this.name);
	}
}

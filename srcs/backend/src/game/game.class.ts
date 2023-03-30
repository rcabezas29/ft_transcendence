import { Server } from 'socket.io';
import { GatewayUser } from "src/gateway-manager/interfaces";
import { Vector2 } from './classes/vector2';
import { GameObject, Paddle } from './classes/game-object';
import { Table } from './classes/table';
import { GameResult } from 'src/users/interfaces/game-info.interface';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayManagerGateway } from 'src/gateway-manager/gateway-manager.gateway';
import exp from 'constants';

const FPS = 60;
const FRAME_TIME = 1 / FPS;
const INITIAL_BALL_SPEED = 100;
const WIN_SCORE = 1

type Move = (playerIndex: number, deltaTime: number) => void;
type gameAction = { move: Move; input: boolean };

export enum GameStatus {
    Preparing,
    Playing,
    End,
}

export default class Game {
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
            player.socket.on('move', (movementIndex: number, pressed: boolean) => {
                this.playerActions[playerIndex][movementIndex].input = pressed;
            });
        });
        
        this.gameInterval = setInterval(() => {
            this.gameLoop();
        }, FRAME_TIME * 1000);
        
        this.notifyFriendsOfGameStart();
        this.gatewayManagerService.setUserAsGaming(this.players[0].id);
        this.gatewayManagerService.setUserAsGaming(this.players[1].id);
		this.notifyNewGameToAllUsers();
    }

	checkGameTimeIsOver(currentTime: Date): boolean {
		return currentTime.getTime() - this.startDate.getTime() >= 200 * 1000;
	}

    gameLoop() {
        const now = new Date();
        
        if (this.checkGameTimeIsOver(now) || this.checkIfMaxScoreWasReached()) {
            this.end();
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
    
	checkIfMaxScoreWasReached(): boolean {
		return (this.score[0] === WIN_SCORE || this.score[1] === WIN_SCORE);
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
        this.score[(receiver + 1) % 2] += 1;
    }
    
    serveBall(ballServer: number) {
		//FIXME: the values of the ball are hardcoded...
        this.ball.hitBox.position.x = 200;
        this.ball.hitBox.position.y = 100;
        this.ball.speed = INITIAL_BALL_SPEED;
        
        this.ball.direction = new Vector2(
            this.table.goals[0].orientation.x * (1 - 2 * ballServer),
            this.table.goals[0].orientation.y * (1 - 2 * ballServer),
        );
    }

	calculateUserElo(user: GatewayUser, other: GatewayUser, userIsWinner: boolean): number {
		const expectedScore = 1 / (1 + 10 ^ ((user.elo - other.elo) / 400));
		const eloScalar = 32;
		const eloModifier = userIsWinner ? 1 : 0;
		const elo = user.elo + eloScalar * (eloModifier - expectedScore);
		return elo;
	}

	//TODO: change function prototype
    end() {
		clearInterval(this.gameInterval);
        console.log('game end', this.name);
        this.status = GameStatus.End; //FIXME: ????

		let winner: GatewayUser | null = null;
		let winnerIndex: number = 0;
		let loser: GatewayUser | null = null;
		let loserIndex: number = 0;

		if (this.score[0] > this.score[1]) {
			winner = this.players[0];
			loser = this.players[1];
			winnerIndex = 0;
			loserIndex = 1;
		} else if (this.score[0] < this.score[1]) {
			winner = this.players[1];
			loser = this.players[0];
			winnerIndex = 1;
			loserIndex = 0;
		}

		if (this.score[0] === this.score[1]) {
			this.players[0].socket.emit('end-game', GameResult.Draw);
			this.players[1].socket.emit('end-game', GameResult.Draw);
		}
		else {
			winner.socket.emit('end-game', GameResult.Win);
			loser.socket.emit('end-game', GameResult.Lose);

			this.usersService.update(winner.id, { elo: this.calculateUserElo(winner, loser, true) });
			this.usersService.update(loser.id, { elo: this.calculateUserElo(loser, winner, false) });
		}

		this.usersService.updateStats(this.players[0].id, {
			gameResult: GameResult.Win,
			scoredGoals: this.score[winnerIndex],
			receivedGoals: this.score[loserIndex],
		});

		this.usersService.updateStats(this.players[1].id, {
			gameResult: GameResult.Lose,
			scoredGoals: this.score[loserIndex],
			receivedGoals: this.score[winnerIndex],
		});

		this.players.forEach((player, index) => {
	
          
			//TODO: move player elo upudate to another function
            
        });

		//TODO: move to another function
        let winnerId: number = 0;
        if (this.score[0] !== this.score[1]) {
            winnerId = this.score[0] > this.score[1] ? this.players[0].id : this.players[1].id;
        }

        this.matchHistoryService.create({
            user1Id: this.players[0].id,
            user2Id: this.players[1].id,
            winner: winnerId,
            score: this.score,
        });
        
		//TODO: move to another function. Maybe removePlayersFromGameChannel() ?
        this.players.forEach((player) => player.socket.leave(this.name));
        
        this.notifyFriendsOfGameEnd();

		//TODO: rename this function
        this.gatewayManagerService.unsetUserAsGaming(this.players[0].id);
        this.gatewayManagerService.unsetUserAsGaming(this.players[1].id);
		this.callEndGameCallbacks();
		this.notifyEndGameToAllUsers();
    }
    
    sendToPlayer(player: GatewayUser, signal: string, body: any) {
        player.socket.emit(signal, body);
    }
    
    rejoinPlayer(player: GatewayUser) {
        for (const i in this.players) {
            if (this.players[i].socket.connected === false)
            this.players[i].socket = player.socket;
            this.players[i].socket.join(this.name);
            this.players[i].socket.on('move', (movementIndex: number, pressed: boolean) => {
                this.playerActions[i][movementIndex].input = pressed;
            });
        }
        this.gatewayManagerService.setUserAsGaming(player.id);
    }
    

	//TODO: maybe this could be moved to game.service
    async notifyFriendsOfGameStart() {
        let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[0].id);
        friends.forEach(friend => {
            friend.socket.emit('friend-in-a-game', this.players[0].id);
        });
        
        friends = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[1].id);
        friends.forEach(friend => {
            friend.socket.emit('friend-in-a-game', this.players[1].id);
        });
    }
    
	//TODO: maybe this could be moved to game.service
    async notifyFriendsOfGameEnd() {
        let friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[0].id);
        friends.forEach(friend => {
            friend.socket.emit('friend-game-ended', this.players[0].id);
        });
        
        friends = await this.gatewayManagerService.getAllUserConnectedFriends(this.players[1].id);
        friends.forEach(friend => {
            friend.socket.emit('friend-game-ended', this.players[1].id);
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
			"player1": this.players[0].username,
			"player2": this.players[1].username
		}
	
		this.server.emit("spectator-new-game", game);
	}
	
	notifyEndGameToAllUsers() {
		this.server.to(this.name).emit("spectator-end-game", this.name);
	}
}

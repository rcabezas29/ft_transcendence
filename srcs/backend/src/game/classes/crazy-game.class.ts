import { Server } from 'socket.io';
import { GatewayUser } from "src/gateway-manager/interfaces";
import { Vector2 } from './vector2';
import { GameObject } from './game-object';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import Game from './game.class';

const FPS = 60;
const FRAME_TIME = 1 / FPS;
const INITIAL_BALL_SPEED = 200;

// TODO: calculate from game-canvas size
const BALL_START_POSITION_X = 400;
const BALL_START_POSITION_Y = 200;

const MAX_BALL_SPEED = 700;

export default class CrazyGame extends Game {
    balls: GameObject[] = [];
    timeSinceLastBall: Date;
    constructor(
        player1: GatewayUser,
        player2: GatewayUser,
        server: Server,
        protected usersService: UsersService,
        protected matchHistoryService: MatchHistoryService,
        protected gatewayManagerService: GatewayManagerService
        ) {
            super(player1, player2, server, usersService, matchHistoryService, gatewayManagerService);
    }

    start() {
        this.balls.push(new GameObject(
            new Vector2(400, 200),
            new Vector2(0, 0),
            new Vector2(10, 10),
            INITIAL_BALL_SPEED,
        ));
        this.serveBall(Math.floor(Math.random() * 2));
        this.timeSinceLastBall = new Date();
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

    protected serveBall(ballServer: number) {
        this.balls[0].hitBox.position.x = BALL_START_POSITION_X;
        this.balls[0].hitBox.position.y = BALL_START_POSITION_Y;
        this.balls[0].speed = INITIAL_BALL_SPEED;
        
        this.balls[0].direction = new Vector2(
            this.table.goals[0].orientation.x * (1 - 2 * ballServer),
            this.table.goals[0].orientation.y * (1 - 2 * ballServer),
        );
    }

    checkIfTimeForNewBall(now: Date) : boolean {
        if (now.getTime() - this.timeSinceLastBall.getTime() < 20 * 1000) {
            return false;
        } else {
            this.timeSinceLastBall = new Date();
            return true;
        }
    }

    protected updateObjects(now: Date) {
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
            this.balls.forEach((ball) => {
                if (paddle.hitBox.overlaps(ball.hitBox)) {
                    ball.direction = paddle.bounceBall(ball);
                    if (ball.speed < MAX_BALL_SPEED) {
                        ball.speed *= 1.1;
                    }
                }
            })
        });
        this.table.walls.forEach((wall) => {
            this.balls.forEach((ball) => {
                if (wall.overlaps(ball.hitBox)) {
                    ball.direction = this.table.reflect(
                        ball.direction,
                        wall.orientation,
                    );
                    ball.hitBox.position.y <= 0 ?
                        ball.hitBox.position.y = 0 :
                        ball.hitBox.position.y = 400 - ball.hitBox.bounds.y;
                }
            })
        });
        this.table.goals.forEach((goal, goalIndex) => {
            this.balls.forEach((ball, ballIndex) => {
                if (goal.overlaps(ball.hitBox)) {
                    this.computeGoal(goalIndex);
                    this.serveNewBall(goalIndex ,ballIndex);
                }
            })
        });
        this.balls.forEach((ball) => {
            ball.updatePosition(deltaTime);
        })
    }

    serveNewBall(ballServer: number, ballIndex: number) {
        this.balls[ballIndex].hitBox.position.x = BALL_START_POSITION_X;
        this.balls[ballIndex].hitBox.position.y = BALL_START_POSITION_Y;
        this.balls[ballIndex].speed = INITIAL_BALL_SPEED;
        
        this.balls[ballIndex].direction = new Vector2(
            this.table.goals[0].orientation.x * (1 - 2 * ballServer),
            this.table.goals[0].orientation.y * (1 - 2 * ballServer),
        );
    }

    protected gameLoop() {
        const now = new Date();
        
        if (this.checkGameTimeIsOver(now)) {
            this.end();
        }
        if (this.checkIfTimeForNewBall(now)) {
            console.log('Serving new Ball');
            this.balls.push(new GameObject(
                    new Vector2(400, 200),
                    new Vector2(0, 0),
                    new Vector2(10, 10),
                    INITIAL_BALL_SPEED,
                ));
            this.serveNewBall(Math.floor(Math.random() * 2), this.balls.length - 1);
            this.timeSinceLastBall = new Date();
        }
        this.updateObjects(now);
        const payload = {
            paddles: this.paddles,
            score: [this.players[0].score, this.players[1].score],
            balls: this.balls,
            currentTime: now,
        };
        this.server.to(this.name).emit('update-game', payload);
    }
}
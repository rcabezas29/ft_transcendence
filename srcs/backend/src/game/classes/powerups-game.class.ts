import { Server } from 'socket.io';
import { GatewayUser } from "src/gateway-manager/interfaces";
import { Vector2 } from './vector2';
import { GameObject, Paddle } from './game-object';
import { UsersService } from 'src/users/users.service';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import Game from './game.class';

const GAME_DURATION = 200; // in seconds

const MAX_BALL_SPEED = 450;

export class PowerUpsGame extends Game {
    powerups: GameObject[] = [];
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

    protected checkIfTimeToPowerUp(currentTime: Date) : boolean {
        if ((currentTime.getTime() - this.startDate.getTime() >= GAME_DURATION / 4 * 1000)
            && (currentTime.getTime() - this.startDate.getTime() <= GAME_DURATION / 4 * 1000 + 18)) {
            return true;
        } else if ((currentTime.getTime() - this.startDate.getTime() >= GAME_DURATION / 2 * 1000)
            && (currentTime.getTime() - this.startDate.getTime() <= GAME_DURATION / 2 * 1000 + 18)) {
            return true;
        } else if ((currentTime.getTime() - this.startDate.getTime() >= (GAME_DURATION / 4 + GAME_DURATION / 2) * 1000)
        && (currentTime.getTime() - this.startDate.getTime() <= (GAME_DURATION / 4 + GAME_DURATION / 2) * 1000 + 18)) {
            return true;
        } else {
            return false;
        }
    }

    apply_powerup() {
        const result : number = Math.floor(Math.random() * 4);
        if (result === 0) {
            console.log('Maax Speeeed');
            this.ball.speed = MAX_BALL_SPEED;
        } else if (result === 1) {
            if (this.ball.direction.x < 0) {
                console.log('Slowed 0');
                this.paddles[0].speed /= 2;
            } else {
                console.log('Slowed 1');
                this.paddles[1].speed /= 2;
            }
        } else if (result === 2) {
            console.log('Change direction');
            this.ball.direction.y *= -1;
        } else if (result === 3) {
            if (this.ball.direction.x < 0) {
                console.log('Increased 1');
                this.paddles[1].hitBox.bounds.y += 10;
            } else {
                console.log('Increased 0');
                this.paddles[0].hitBox.bounds.y += 10;
            }
        }
    }

    protected updateObjects(now: Date): void {
        super.updateObjects(now);
        this.powerups.forEach((pow, i) => {
            if (pow.hitBox.overlaps(this.ball.hitBox)) {
                this.powerups.splice(i, 1);
                this.apply_powerup();
            }
        });
    }

    protected gameLoop(): void {
        const now = new Date();
        
        if (this.checkGameTimeIsOver(now) || this.checkIfMaxScoreWasReached()) {
            this.end();
        }
        if (this.checkIfTimeToPowerUp(now)) {
            this.powerups.push(new GameObject(
                new Vector2(200 - 10, Math.random() * 150 + 25),
                new Vector2(0, 0),
                new Vector2(20, 20),
                0,
            ));
        }
        this.updateObjects(now);
        const payload = {
            paddles: this.paddles,
            score: [this.players[0].score, this.players[1].score],
            balls: [this.ball],
            currentTime: now,
            powerups: this.powerups,
        };
        this.server.to(this.name).emit('update-game', payload);
    }
    
}
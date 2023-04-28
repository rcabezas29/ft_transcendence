import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameService } from './game.service';
import { GameSelection } from './interfaces/game-selection.interface';

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
  
interface GameCustomization {
	gameSelection: GameSelection;
	paddleColor: PaddleColorSelection;
}

@Injectable()
export class MatchmakingService {

	private originalQueue: GatewayUser[] = [];
	private supercoolQueue: GatewayUser[] = [];
	private crazyQueue: GatewayUser[] = [];

	private queues: GatewayUser[][] = [];

	constructor(
		private usersService: UsersService,
		private gameService: GameService
	) {
		this.queues.push(this.originalQueue);
		this.queues.push(this.supercoolQueue);
		this.queues.push(this.crazyQueue);
	}

	async searchGame(requestor: GatewayUser, gameCustomization: GameCustomization) {
		const user: User = await this.usersService.findOneById(requestor.id);
		requestor.elo = user.elo;
		requestor.color = gameCustomization.paddleColor;

		for (let i : number = 0; i < this.queues.length; i++) {
			let queue : GatewayUser[] = this.queues[i];
			if (queue.find((player) => player.id === requestor.id) !== undefined) {
				console.log('player already in a queue');
				return ;
			}
		}

		if (gameCustomization.gameSelection === GameSelection.Original) {
			this.originalQueue.push(requestor);
		} else if (gameCustomization.gameSelection === GameSelection.SuperCool) {
			this.supercoolQueue.push(requestor);
		} else if (gameCustomization.gameSelection === GameSelection.Crazy) {
			this.crazyQueue.push(requestor);
		}
	}

	cancelSearch(playerToRemove: GatewayUser) {
		this.queues.forEach((queue) => {
			const index = queue.indexOf(playerToRemove);
			if (index != -1) {
				playerToRemove.socket.emit('removed-from-queue');
				queue.splice(index, 1);
			}
		});
	}

	@Cron(CronExpression.EVERY_5_SECONDS)
	matchmakingCron() {
		this.queues.forEach((usersQueue, queueIndex) => {
			if (usersQueue.length < 2)
				return ;
			const user1 = usersQueue[0];
			usersQueue.splice(0, 1); // <-- shift/unshift?
			const user2 = this.findAdversaryFor(user1, usersQueue);
			const user2Index = usersQueue.findIndex((user) => user.id === user2.id);
			usersQueue.splice(user2Index, 1);
			this.gameService.createGame(user1, user2, queueIndex);
		});
	}

	findAdversaryFor(user: GatewayUser, usersQueue: GatewayUser[]) {
		let adversary: GatewayUser;
		let lastEloDiff: number = 9999999;
		for (const queueIndex in usersQueue) {
			const queueUser = usersQueue[queueIndex];
			const eloDiff = Math.abs(user.elo - queueUser.elo);
			if (eloDiff < lastEloDiff) {
				lastEloDiff = eloDiff;
				adversary = queueUser;
			}
		}
		return adversary;
	}
}

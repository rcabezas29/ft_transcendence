import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameService } from './game.service';

enum GameSelection {
	Original,
	SuperCool,
	Obstacles,
	Crazy,
}

@Injectable()
export class MatchmakingService {

	private originalQueue: GatewayUser[] = [];
	private supercoolQueue: GatewayUser[] = [];
	private obstaclesQueue: GatewayUser[] = [];
	private crazyQueue: GatewayUser[] = [];

	private queues: GatewayUser[][] = [];

	constructor(
		private usersService: UsersService,
		private gameService: GameService
	) {
		this.queues.push(this.originalQueue);
		this.queues.push(this.supercoolQueue);
		this.queues.push(this.obstaclesQueue);
		this.queues.push(this.crazyQueue);
	}

	async searchGame(requestor: GatewayUser, gameSelection: GameSelection) {
		console.log("User: ", requestor.id, "- searchGame ", gameSelection);
		const user: User = await this.usersService.findOneById(requestor.id);
		requestor.elo = user.elo;

		if (gameSelection === GameSelection.Original) {
			if (this.originalQueue.find((user) => user.id === requestor.id) === undefined)
				this.originalQueue.push(requestor);
		} else if (gameSelection === GameSelection.SuperCool) {
			if (this.supercoolQueue.find((user) => user.id === requestor.id) === undefined)
				this.supercoolQueue.push(requestor);
		} else if (gameSelection === GameSelection.Obstacles) {
			if (this.obstaclesQueue.find((user) => user.id === requestor.id) === undefined)
				this.obstaclesQueue.push(requestor);
		} else if (gameSelection === GameSelection.Crazy) {
			if (this.crazyQueue.find((user) => user.id === requestor.id) === undefined)
				this.crazyQueue.push(requestor);
		}
	}

	@Cron(CronExpression.EVERY_5_SECONDS)
	matchmakingCron() {
		this.queues.forEach((usersQueue) => {
			if (usersQueue.length < 2)
				return ;
			const user1 = usersQueue[0];
			usersQueue.splice(0, 1); // <-- shift/unshift?
			const user2 = this.findAdversaryFor(user1, usersQueue);
			const user2Index = usersQueue.findIndex((user) => user.id === user2.id);
			usersQueue.splice(user2Index, 1);
			this.gameService.createGame(user1, user2);
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

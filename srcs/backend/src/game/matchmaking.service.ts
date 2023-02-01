import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameService } from './game.service';

@Injectable()
export class MatchmakingService {

	private usersQueue: GatewayUser[] = [];

	constructor(
		private usersService: UsersService,
		private gameService: GameService
	) {}

	async searchGame(requestor: GatewayUser) {
		console.log("User: ", requestor.id, "- searchGame");
		const user: User = await this.usersService.findOne(requestor.id);
		requestor.elo = user.elo;
		this.usersQueue.push(requestor);
	}

	@Cron(CronExpression.EVERY_5_SECONDS)
	matchmakingCron() {
		if (this.usersQueue.length < 2)
			return;
		const user1 = this.usersQueue[0];
		this.usersQueue.splice(0, 1);
		const user2 = this.findAdversaryFor(user1);
		const user2Index = this.usersQueue.findIndex((user) => user.id == user2.id);
		this.usersQueue.splice(user2Index, 1);
		this.gameService.createGame(user1, user2);
	}

	findAdversaryFor(user: GatewayUser) {
		let adversary: GatewayUser;
		let lastEloDiff: number = 9999999;
		for (const queueIndex in this.usersQueue) {
			const queueUser = this.usersQueue[queueIndex];
			const eloDiff = Math.abs(user.elo - queueUser.elo);
			if (eloDiff < lastEloDiff) {
				lastEloDiff = eloDiff;
				adversary = queueUser;
			}
		}
		return adversary;
	}
}

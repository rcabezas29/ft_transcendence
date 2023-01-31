import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';

enum GameStatus {
	Preparing = "preparing",
	Playing = "playing",
	End = "end"
}

class Game {
	name: string;
	players: GatewayUser[] = [];
	viwers: GatewayUser[] = [];
	status: GameStatus;
	start: Date;
	gameInterval: NodeJS.Timer;

	constructor(player1: GatewayUser, player2: GatewayUser) {
		this.players.push(player1);
		this.players.push(player2);
		this.status = GameStatus.Preparing;
		this.name = this.players[0].username + "_game_" + this.players[1].username;
		this.players.forEach(player => player.socket.join(this.name))
		this.start = new Date();
		this.startGame();
	}

	startGame() {
		console.log("game start", this.name);
		this.status = GameStatus.Playing;
		this.players.forEach(player => player.socket.emit("start-game"));
		this.gameInterval = setInterval(() => { this.loop() }, 1);
	}

	loop() {
		console.log("game running", this.name);

		const moment = new Date();

		if ((moment.getTime() - this.start.getTime()) >= 10 * 1000) {
			clearInterval(this.gameInterval);
			this.end();
		}

		this.players.forEach(player => player.socket.emit("game", moment));
	}

	end() {
		console.log("game end", this.name);
		this.status = GameStatus.End;
		this.players.forEach(player => player.socket.emit("end-game"));
		this.players.forEach(player => player.socket.leave(this.name))
	}
}

@Injectable()
export class GameService {

	private games: Game[] = [];

	createGame(user1: GatewayUser, user2: GatewayUser) {
		this.games.push(new Game(user1, user2));
	}

	endGame() {

	}


}

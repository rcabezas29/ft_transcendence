import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'

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
	startDate: Date;
	gameInterval: NodeJS.Timer;
	server: Server

	constructor(player1: GatewayUser, player2: GatewayUser, server: Server) {
		this.server = server;
		this.players.push(player1);
		this.players.push(player2);
		this.status = GameStatus.Preparing;
		this.name = this.players[0].username + "_game_" + this.players[1].username;

		for (let i in this.players) {
			this.players[i].socket.join(this.name);
		}

		this.startDate = new Date();
		this.start();
	}

	start() {
		this.status = GameStatus.Playing;
		this.server.to(this.name).emit("start-game");
		this.gameInterval = setInterval(() => { this.loop() }, 1000);
	}

	loop() {
		const moment = new Date();

		if ((moment.getTime() - this.startDate.getTime()) >= 10 * 1000) {
			clearInterval(this.gameInterval);
			this.end();
		}

		this.server.to(this.name).emit("update-game", moment);
	}

	end() {
		console.log("game end", this.name);
		this.status = GameStatus.End;
		this.server.to(this.name).emit("end-game");
		this.players.forEach(player => player.socket.leave(this.name))
	}
}

@Injectable()
export class GameService {

	public server: Server;

	createGame(user1: GatewayUser, user2: GatewayUser) {
		new Game(user1, user2, this.server);
	}

}

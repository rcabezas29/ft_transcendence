import { Injectable } from '@nestjs/common';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'


const FPS = (1 / 60) * 1000;


enum GameStatus {
	Preparing = "preparing",
	Playing = "playing",
	End = "end"
}

class Vector2 {
	x: number;
	y: number;

	constructor (x : number, y : number) {
		this.x = x;
		this.y = y;
	}
}

function addVec2(u : Vector2, v : Vector2) : Vector2 {
	return new Vector2(u.x + v.x, u.y + v.y);
}

function multConstToVec2(k : number, u : Vector2) : Vector2 {
	return new Vector2(u.x * k, u.y * k);
}

function rotateVec2(u : Vector2, angle : number) : Vector2 {
	let v : Vector2 = new Vector2(
		u.x * Math.cos(angle) - u.y * Math.sin(angle), 
		u.x * Math.sin(angle) + u.y * Math.cos(angle)
	);

	return v;
}

class HitBox {
	position: Vector2;
	orientation: Vector2;
	bounds: Vector2;

	constructor (position : Vector2, orientation : Vector2, bounds : Vector2) {
		this.position = position;
		this.orientation = orientation;
		this.bounds = bounds;
	}

	withinBounds(object: HitBox): boolean {
		return (
			(object.position.x >= this.position.x && 
				object.position.x <= this.position.x + this.bounds.x) && 
				(object.position.y >= this.position.y  && 
					object.position.y <= this.position.y + this.bounds.y)
			);
	}
}

class GameObject {
	hitBox : HitBox;
	direction : Vector2;
	speed: number;

	constructor(position : Vector2, orientation : Vector2, bounds : Vector2, speed: number) {
		this.hitBox = new HitBox(position, orientation, bounds);
		this.direction = new Vector2(0, 0);
		this.speed = speed;
	}

	updatePosition() {
		this.hitBox.position = addVec2(this.hitBox.position, multConstToVec2(this.speed, this.direction));
	}
}

class Paddle extends GameObject {

	bounceDirections : Vector2[] = [];

	constructor(position : Vector2, orientation : Vector2, length : number) {
		let width : number = orientation.x ? 1 : length;
		let height: number = orientation.y ? 1 : length;

		super(position, orientation, new Vector2(width, height), 0);

		let angleDifference : number = (Math.PI / 6);
		//fix transposition
		let transposedOrientation : Vector2 = new Vector2(orientation.y,  -orientation.x);
		this.bounceDirections[0] = rotateVec2(transposedOrientation, angleDifference);
		for (let i: number = 1; i  < 3; ++i) {
			this.bounceDirections.push(rotateVec2(this.bounceDirections[i - 1], angleDifference));
		}
		this.bounceDirections[2] = new Vector2(orientation.x, orientation.y);
		for (let i: number = 3; i  < 5; ++i) {
			this.bounceDirections.push(rotateVec2(this.bounceDirections[i - 1], angleDifference));
		}

		console.table(this.bounceDirections);
	}
}

class Table {
	walls : Array<HitBox>;
	goals : Array<HitBox>;


	constructor (/* config info */) {
		this.walls = new Array<HitBox>;
		this.goals = new Array<HitBox>;
		this.walls.push(new HitBox(new Vector2(0, -40), new Vector2(0, -1) , new Vector2(400, 40)));
		this.walls.push(new HitBox(new Vector2(0, 200), new Vector2(0, 1) , new Vector2(400, 40)));
		this.goals.push(new HitBox(new Vector2(-40, 0), new Vector2(1, 0) , new Vector2(40, 200)));
		this.goals.push(new HitBox(new Vector2(400, 0), new Vector2(-1, 0) , new Vector2(40, 200)));
	}

	reflect(u : Vector2, v : Vector2) : Vector2 {
		let w = new Vector2(u.x * (v.x ? -1 : 1) , u.y * (v.y ? -1 : 1));
		return w;
	}
}

class Game {
	name: string;
	players: GatewayUser[] = [];
	viwers: GatewayUser[] = [];
	status: GameStatus;
	startDate: Date;
	gameInterval: NodeJS.Timer;
	server: Server

	score : number[];
	ball : GameObject;
	paddles : Paddle[];
	table : Table;

	constructor(player1: GatewayUser, player2: GatewayUser, server: Server) {
		this.server = server;
		this.players.push(player1);
		this.players.push(player2);
		this.status = GameStatus.Preparing;
		this.name = this.players[0].username + "_game_" + this.players[1].username;
		this.table = new Table();
		this.score = [0, 0];

		for (let i in this.players) {
			this.players[i].socket.join(this.name);
		}

		this.startDate = new Date();
		this.start();

	}

	start() {

		this.ball = new GameObject(new Vector2(200, 100), new Vector2(0, 0), new Vector2(10, 10), 1);
		this.serveBall(Math.floor((Math.random() * 2)));
		this.instancePaddles();
		this.status = GameStatus.Playing;
		this.server.to(this.name).emit("start-game");
		this.players.forEach((player) => {
				player.socket.on("disconnect", () => {
				console.log(`${player.username} left the room`);
				//award the game to the player that has not disconnected
				this.end();
			})
		});
		
		this.gameInterval = setInterval(() => { this.gameLoop() }, FPS);
	}

	instancePaddles() {
		this.paddles = [];
		this.paddles[0] = new Paddle(
			new Vector2(40, 100),
			this.table.goals[0].orientation,
			20
		);
		this.paddles[1] = new Paddle(
			new Vector2(400 - 40, 100),
			this.table.goals[1].orientation,
			20
		);
	}

	gameLoop() {
		const moment = new Date();

		if ((moment.getTime() - this.startDate.getTime()) >= 200 * 1000) {
			this.end();
		}
		this.updateObjects();
		const payload = {
			paddles : this.paddles,
			score : this.score,
			ball : this.ball,
			moment : moment,
		}
		this.server.to(this.name).emit("update-game", payload);
	}

	updateObjects() {
		this.table.walls.forEach((wall) => {
			if (wall.withinBounds(this.ball.hitBox)) {
				this.ball.direction = this.table.reflect(this.ball.direction, wall.orientation);
			}
		});
		this.table.goals.forEach((goal, index) => {
			if (goal.withinBounds(this.ball.hitBox)) {
				this.computeGoal(index);
			}
		});
		this.ball.updatePosition();
	}

	computeGoal(receiver : number) {
		this.score[(receiver + 1) % 2] += 1;
		this.serveBall(receiver);
		//if score[0] || score[1] === 7 emit end
	}
	
	serveBall(ballServer : number) {
		this.ball.hitBox.position.x = 200;
		this.ball.hitBox.position.y = 100;
		this.ball.speed = 1;

		this.ball.direction = new Vector2(
			(this.table.goals[0].orientation.x) * (1 - (2 * ballServer)), 
			(this.table.goals[0].orientation.y) * (1 - (2 * ballServer))
		);
	}

	end() {
		clearInterval(this.gameInterval);
		console.log("game end", this.name);
		this.status = GameStatus.End;
		this.server.to(this.name).emit("end-game");
		this.players.forEach(player => player.socket.leave(this.name))
	}

	sendToPlayer(player: GatewayUser, signal : string, body : any) {
		player.socket.emit(signal, body);
	}
}

@Injectable()
export class GameService {

	public server: Server;

	createGame(user1: GatewayUser, user2: GatewayUser) {
		new Game(user1, user2, this.server);
	}

}

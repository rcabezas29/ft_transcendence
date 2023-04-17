import { HitBox } from "./hitbox";
import { Vector2, addVec2, multConstToVec2, rotateVec2 } from "./vector2";

export class GameObject {
    hitBox: HitBox;
    direction: Vector2;
    speed: number;
  
    constructor(
      position: Vector2,
      orientation: Vector2,
      bounds: Vector2,
      speed: number,
    ) {
      this.hitBox = new HitBox(position, orientation, bounds);
      this.direction = new Vector2(0, 0);
      this.speed = speed;
    }
  
    updatePosition(deltaTime: number) {
      this.hitBox.position = addVec2(
        this.hitBox.position,
        multConstToVec2(this.speed * deltaTime, this.direction),
      );
    }
}

const PADDLE_SPEED = 400; // in px per second;

export class Paddle extends GameObject {
    bounceDirections: Vector2[] = [];
    gameArea: HitBox;
    sectionLength: number;
    color: string;
  
    constructor(
      position: Vector2,
      orientation: Vector2,
      length: number,
      gameArea: HitBox,
      color: string
    ) {
      const width: number = orientation.x ? 10 : length;
      const height: number = orientation.y ? 10 : length;
  
      super(position, orientation, new Vector2(width, height), PADDLE_SPEED);
      this.color = color;
  
      let angleDifference: number = Math.PI / 6;
      if (orientation.x) angleDifference *= orientation.x;
      else angleDifference *= orientation.y;
      //fix transposition
      const transposedOrientation: Vector2 = new Vector2(
        -Math.abs(orientation.y),
        -Math.abs(orientation.x),
      );
      this.bounceDirections[0] = rotateVec2(
        transposedOrientation,
        angleDifference,
      );
      for (let i = 1; i < 3; ++i) {
        this.bounceDirections.push(
          rotateVec2(this.bounceDirections[i - 1], angleDifference),
        );
      }
      this.bounceDirections[2] = new Vector2(orientation.x, orientation.y);
      for (let i = 3; i < 5; ++i) {
        this.bounceDirections.push(
          rotateVec2(this.bounceDirections[i - 1], angleDifference),
        );
      }
  
      this.gameArea = gameArea;
      this.sectionLength = length / this.bounceDirections.length;
    }
  
    moveUp(deltaTime: number) {
      const newPosition: Vector2 = new Vector2(
        this.hitBox.position.x,
        this.hitBox.position.y - this.speed * deltaTime,
      );
      this.move(newPosition);
    }
  
    moveDown(deltaTime: number) {
      const newPosition: Vector2 = new Vector2(
        this.hitBox.position.x,
        this.hitBox.position.y + this.speed * deltaTime,
      );
      this.move(newPosition);
    }
  
    move(newPosition: Vector2) {
      const newHitbox = new HitBox(
        newPosition,
        this.hitBox.orientation,
        this.hitBox.bounds,
      );
      if (this.gameArea.contains(newHitbox)) {
        this.hitBox.position.y = newHitbox.position.y;
        this.hitBox.position.x = newHitbox.position.x;
      }
    }
  
    bounceBall(ball: GameObject): Vector2 {
      const ballPosition: number =
        ball.hitBox.position.y + ball.hitBox.bounds.y / 2;
      const bouncePoints: number[] = [];
  
      this.bounceDirections.forEach((_, index) => {
        bouncePoints.push(
          this.hitBox.position.y + this.sectionLength * (index + 1),
        );
      });
  
      for (let i = 0; i < bouncePoints.length; ++i) {
        if (ballPosition < bouncePoints[i]) {
          return this.bounceDirections[i];
        }
      }
      return this.bounceDirections[bouncePoints.length - 1];
    }
}
  
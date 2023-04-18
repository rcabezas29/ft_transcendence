interface Vector2 {
  x: number;
  y: number;
}

interface HitBox {
  position: Vector2;
  orientation: Vector2;
  bounds: Vector2;
}

export interface GameObject {
  hitBox: HitBox;
  direction: Vector2;
  speed: number;
}

export interface PowerUp extends GameObject {
  type: number;
}

export interface Paddle extends GameObject {
  bounceDirections: Vector2[];
  gameArea: HitBox;
  sectionLength: number;
  color: string;
}

export interface UpdateGamePayload {
  paddles: Paddle[];
  score: number[];
  balls: GameObject[];
  currentTime: Date;
  powerups: GameObject[];
}

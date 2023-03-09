export class Vector2 {
    x: number;
    y: number;
  
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
}
  
export function addVec2(u: Vector2, v: Vector2): Vector2 {
    return new Vector2(u.x + v.x, u.y + v.y);
}

export function multConstToVec2(k: number, u: Vector2): Vector2 {
    return new Vector2(u.x * k, u.y * k);
}

export function rotateVec2(u: Vector2, angle: number): Vector2 {
    const v: Vector2 = new Vector2(
        u.x * Math.cos(angle) - u.y * Math.sin(angle),
        u.x * Math.sin(angle) + u.y * Math.cos(angle),
    );

    return v;
}

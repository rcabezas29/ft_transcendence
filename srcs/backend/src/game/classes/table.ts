import { HitBox } from "./hitbox";
import { Vector2 } from "./vector2";

export class Table {
    walls: Array<HitBox>;
    goals: Array<HitBox>;
    area: HitBox;
  
    constructor() {
      this.walls = new Array<HitBox>();
      this.goals = new Array<HitBox>();
      this.area = new HitBox(
        new Vector2(0, 0),
        new Vector2(1, 0),
        new Vector2(800, 400),
      );
      this.walls.push(
        new HitBox(new Vector2(0, -40), new Vector2(0, -1), new Vector2(800, 40)),
      );
      this.walls.push(
        new HitBox(new Vector2(0, 400), new Vector2(0, 1), new Vector2(800, 40)),
      );
      this.goals.push(
        new HitBox(new Vector2(-40, 0), new Vector2(1, 0), new Vector2(40, 400)),
      );
      this.goals.push(
        new HitBox(new Vector2(800, 0), new Vector2(-1, 0), new Vector2(40, 400)),
      );
    }
  
    reflect(u: Vector2, v: Vector2): Vector2 {
      const w = new Vector2(u.x * (v.x ? -1 : 1), u.y * (v.y ? -1 : 1));
      return w;
    }
  }
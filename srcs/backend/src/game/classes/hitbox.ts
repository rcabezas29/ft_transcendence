import { Vector2 } from "./vector2";

export class HitBox {
    position: Vector2;
    orientation: Vector2;
    bounds: Vector2;
  
    constructor(position: Vector2, orientation: Vector2, bounds: Vector2) {
      this.position = position;
      this.orientation = orientation;
      this.bounds = bounds;
    }
  
    contains(object: HitBox): boolean {
      return this.incidentPoints(object) === 4;
    }
  
    overlaps(object: HitBox): boolean {
      return this.incidentPoints(object) > 0;
    }
  
    incidentPoints(object: HitBox): number {
      let pointCount = 0;
  
      pointCount += Number(isPointInHitBox(object.position, this));
      pointCount += Number(
        isPointInHitBox(
          new Vector2(object.position.x, object.position.y + object.bounds.y),
          this,
        ),
      );
      pointCount += Number(
        isPointInHitBox(
          new Vector2(object.position.x + object.bounds.x, object.position.y),
          this,
        ),
      );
      pointCount += Number(
        isPointInHitBox(
          new Vector2(
            object.position.x + object.bounds.x,
            object.position.y + object.bounds.y,
          ),
          this,
        ),
      );
  
      return pointCount;
    }
}

function isPointInHitBox(point: Vector2, hitbox: HitBox): boolean {
    return (
      point.x >= hitbox.position.x &&
      point.x <= hitbox.position.x + hitbox.bounds.x &&
      point.y >= hitbox.position.y &&
      point.y <= hitbox.position.y + hitbox.bounds.y
    );
}
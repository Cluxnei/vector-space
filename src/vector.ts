export class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  public copy(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public add(vector: Vector2): Vector2 {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  public sub(vector: Vector2): Vector2 {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  public scale(scaleX = 1, scaleY?: number): Vector2 {
    this.x *= scaleX;
    this.y *= scaleY ?? scaleX;
    return this;
  }

  public magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  public normalize(): Vector2 {
    const magnitude = this.magnitude();
    this.x /= magnitude;
    this.y /= magnitude;
    return this;
  }
}

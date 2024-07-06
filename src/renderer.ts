export interface IDrawArcOptions {
  x: number;
  y: number;
  radius: number;
  color: string;
  mode: "fill" | "stroke";
}

export interface IDrawArrowOptions {
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
  head_length: number;
}

export interface IRenderer {
  drawArc: (options: IDrawArcOptions) => void;
  drawArrow: (options: IDrawArrowOptions) => void;
}

export class CanvasRenderer implements IRenderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly width: number,
    private readonly height: number,
  ) {}

  public clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  public drawArc(options: IDrawArcOptions): void {
    this.ctx.beginPath();
    this.ctx.arc(options.x, options.y, options.radius, 0, 2 * Math.PI);
    this.ctx[options.mode === "fill" ? "fillStyle" : "strokeStyle"] =
      options.color;
    this.ctx[options.mode]();
  }

  public drawArrow(options: IDrawArrowOptions): void {
    const angle = Math.atan2(
      options.to.y - options.from.y,
      options.to.x - options.from.x,
    );

    // Draw the line
    this.ctx.beginPath();
    this.ctx.moveTo(options.from.x, options.from.y);
    this.ctx.lineTo(options.to.x, options.to.y);

    // Draw the arrow head
    this.ctx.lineTo(
      options.to.x - options.head_length * Math.cos(angle - Math.PI / 6),
      options.to.y - options.head_length * Math.sin(angle - Math.PI / 6),
    );
    this.ctx.moveTo(options.to.x, options.to.y);
    this.ctx.lineTo(
      options.to.x - options.head_length * Math.cos(angle + Math.PI / 6),
      options.to.y - options.head_length * Math.sin(angle + Math.PI / 6),
    );
    this.ctx.stroke();
  }
}

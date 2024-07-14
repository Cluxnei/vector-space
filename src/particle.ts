import { Simulation } from "./simulation.ts";
import { IRenderer } from "./renderer.ts";
import { Vector2 } from "./vector.ts";
import {
  INumberRange,
  IVectorRange,
  newtonGravitationLaw,
  randomNumberBetween,
} from "./utils.ts";

export interface IParticleFactoryOptions {
  position_range: IVectorRange;
  velocity_range: IVectorRange;
  radius_range: INumberRange;
  density_range: INumberRange;
}

export interface IOverFlow {
  leftTop: boolean;
  leftBottom: boolean;
  rightTop: boolean;
  rightBottom: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
  topLeft: boolean;
  topRight: boolean;
}

export class Particle {
  private simulationRef?: Simulation;
  private readonly mass: number;
  private readonly volume: number;
  private forces: Vector2;
  private acceleration: Vector2;

  constructor(
    private position: Vector2,
    private velocity: Vector2,
    private radius: number,
    private density: number,
  ) {
    this.forces = new Vector2();
    this.acceleration = new Vector2();
    this.volume = (4 / 3) * Math.PI * this.radius ** 3;
    this.mass = this.volume * this.density;
  }

  public setSimulationRef(ref: Simulation): void {
    this.simulationRef = ref;
  }

  public update(delta: number): void {
    this.updateForces();
    this.acceleration = this.forces.copy().scale(1 / this.mass);
    this.velocity.add(this.acceleration.copy().scale(delta));
    const nextPosition = this.position
      .copy()
      .add(this.velocity.copy().scale(delta));
    const overFlow = this.getOverflow(nextPosition);
    const computeExtraForce = Object.values(overFlow).some((v) => v);
    if (!computeExtraForce) {
      this.position = nextPosition;
    } else {
      this.velocity = this.getOverFlowVelocity(overFlow);
      this.position.add(this.velocity.copy().scale(delta));
    }
  }

  private getOverFlowVelocity(overFlow: IOverFlow): Vector2 {
    const factor = 0.1;
    if (overFlow.rightTop || overFlow.topRight) {
      return new Vector2(-this.velocity.x * factor, -this.velocity.y * factor);
    }
    if (overFlow.rightBottom || overFlow.leftTop || overFlow.leftBottom) {
      return new Vector2(-this.velocity.x * factor, this.velocity.y * factor);
    }
    if (overFlow.topLeft || overFlow.bottomRight || overFlow.bottomLeft) {
      return new Vector2(this.velocity.x * factor, -this.velocity.y * factor);
    }
    return new Vector2();
  }

  private getOverflow(vector: Vector2): IOverFlow {
    const corners: IOverFlow = {
      leftTop: false,
      leftBottom: false,
      rightTop: false,
      rightBottom: false,
      bottomLeft: false,
      bottomRight: false,
      topLeft: false,
      topRight: false,
    };
    if (!this.simulationRef) {
      return Object.keys(corners).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as IOverFlow,
      );
    }
    const { x: boundX, y: boundY } = this.simulationRef.bounds;
    if (vector.x < boundX[0] + this.radius) {
      corners.leftTop = vector.y + this.radius < boundY[1] / 2;
      corners.leftBottom = !corners.leftTop;
    }
    if (vector.x > boundX[1] - this.radius) {
      corners.rightTop = vector.y - this.radius < boundY[1] / 2;
      corners.rightBottom = !corners.rightTop;
    }
    if (vector.y < boundY[0] + this.radius) {
      corners.topLeft = vector.x + this.radius < boundX[1] / 2;
      corners.topRight = !corners.topLeft;
    }
    if (vector.y > boundY[1] - this.radius) {
      corners.bottomLeft = vector.x - this.radius < boundX[1] / 2;
      corners.bottomRight = !corners.bottomLeft;
    }
    return corners;
  }

  private updateForces(): void {
    if (!this.simulationRef) {
      return;
    }
    this.forces = this.simulationRef.particles.reduce(
      (forces: Vector2, particle: Particle) =>
        forces.add(this.attractionTo(particle)),
      new Vector2(),
    );
  }

  private attractionTo(particle: Particle): Vector2 {
    if (particle == this) {
      return new Vector2();
    }
    const distanceBetween: Vector2 = particle.position
      .copy()
      .sub(this.position);
    const distanceBetweenScalar: number = distanceBetween.magnitude();
    const forceScalar: number = newtonGravitationLaw(
      this.mass,
      particle.mass,
      distanceBetweenScalar,
    );
    return distanceBetween.normalize().scale(forceScalar); // return force vector
  }

  public render(renderer: IRenderer, delta: number): void {
    renderer.drawArc({
      x: this.position.x,
      y: this.position.y,
      radius: this.radius,
      color: "white",
      mode: "fill",
    });

    const to = this.position.copy().add(this.acceleration.copy().scale(delta));
    renderer.drawArrow({
      from: {
        x: this.position.x,
        y: this.position.y,
      },
      to: {
        x: to.x,
        y: to.y,
      },
      head_length: 10,
      color: "red",
    });
  }

  public static factory(options: IParticleFactoryOptions): Particle {
    const position = new Vector2(
      randomNumberBetween(...options.position_range.x),
      randomNumberBetween(...options.position_range.y),
    );
    const velocity = new Vector2(
      randomNumberBetween(...options.velocity_range.x),
      randomNumberBetween(...options.velocity_range.y),
    );
    const radius = randomNumberBetween(...options.radius_range);
    const density = randomNumberBetween(...options.density_range);
    return new Particle(position, velocity, radius, density);
  }
}

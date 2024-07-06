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
    // this.velocity.add(this.acceleration.copy().scale(delta));
    // this.position.add(this.velocity.copy().scale(delta));
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

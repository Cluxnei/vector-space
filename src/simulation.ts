import { IParticleFactoryOptions, Particle } from "./particle.ts";
import { IRenderer } from "./renderer.ts";
import { IVectorRange } from "./utils.ts";

export interface ISimulationFactoryOptions {
  particle_count: number;
  bound_range: IVectorRange;
}

export class Simulation {
  constructor(
    public readonly particles: Particle[],
    public readonly bounds: IVectorRange,
  ) {
    this.setRef();
  }

  private setRef(): void {
    this.particles.forEach((particle: Particle) => {
      particle.setSimulationRef(this);
    });
  }

  public update(delta: number): void {
    this.particles.forEach((particle: Particle) => {
      particle.update(delta);
    });
  }

  public render(renderer: IRenderer, delta: number): void {
    this.particles.forEach((particle: Particle) => {
      particle.render(renderer, delta);
    });
  }

  public static factory(options: ISimulationFactoryOptions): Simulation {
    const particleSettings: IParticleFactoryOptions = {
      density_range: [1, 1],
      radius_range: [3, 3],
      velocity_range: { x: [0, 0], y: [0, 0] },
      position_range: { x: options.bound_range.x, y: options.bound_range.y },
    };
    const centerParticle = Particle.factory({
      ...particleSettings,
      density_range: [5000, 5000],
      radius_range: [80, 80],
      position_range: {
        x: [options.bound_range.x[1] / 2, options.bound_range.x[1] / 2],
        y: [options.bound_range.y[1] / 2, options.bound_range.y[1] / 2],
      },
    });
    const particles = new Array(options.particle_count)
      .fill(0)
      .map(() => Particle.factory(particleSettings));
    particles.push(centerParticle);
    return new Simulation(particles, options.bound_range);
  }
}

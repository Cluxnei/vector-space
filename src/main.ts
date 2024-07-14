import "./style.css";
import { Simulation } from "./simulation.ts";
import { CanvasRenderer } from "./renderer.ts";
import { IVectorRange } from "./utils.ts";

function main() {
  const bound_range: IVectorRange = {
    x: [0, window.innerWidth],
    y: [0, window.innerHeight],
  };
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    return;
  }
  canvas.width = bound_range.x[1];
  canvas.height = bound_range.y[1];
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const delta = 0.008;
  const simulation = Simulation.factory({
    particle_count: 1000,
    bound_range,
  });
  const renderer = new CanvasRenderer(ctx, canvas.width, canvas.height);

  function loop() {
    simulation.update(delta);
    renderer.clear();
    simulation.render(renderer, delta);
    requestAnimationFrame(loop);
  }

  loop();
}

main();

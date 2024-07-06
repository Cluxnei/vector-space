export type INumberRange = [number, number];

export interface IVectorRange {
  x: INumberRange;
  y: INumberRange;
}

export function randomNumberBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function newtonGravitationLaw(
  m1: number,
  m2: number,
  d: number,
): number {
  const G = 6.67e-11 * 10e10;
  return G * ((m1 * m2) / (d * d));
}

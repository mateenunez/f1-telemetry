export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function polarPoint(
  angleDeg: number,
  radius: number,
  cx = 50,
  cy = 50,
): { x: number; y: number } {
  const rad = degToRad(angleDeg);
  return { x: cx - radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}

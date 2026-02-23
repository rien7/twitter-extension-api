// Minimal canvas shim for bundlers/environments where native `canvas` is unavailable.
// linkedom touches this module during initialization, but transaction-id generation
// does not require real drawing capabilities.
class CanvasShim {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(): null {
    // No-op context in extension runtime.
    return null;
  }

  toDataURL(): string {
    // Return a stable empty payload instead of throwing.
    return '';
  }
}

export function createCanvas(width = 300, height = 150): CanvasShim {
  return new CanvasShim(width, height);
}

export default { createCanvas };

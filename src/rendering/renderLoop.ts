export type RenderLoopRef = {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  active: boolean;
  frameId: number | null;
};

export function createRenderLoop(canvas: HTMLCanvasElement, video: HTMLVideoElement): RenderLoopRef {
  return { canvas, video, active: true, frameId: null };
}

export function startRenderLoop(
  ref: RenderLoopRef,
  onFrame: (timestamp: number) => void,
): void {
  if (!ref.active) return;
  ref.frameId = requestAnimationFrame((timestamp) => {
    if (!ref.active) return;
    onFrame(timestamp);
    startRenderLoop(ref, onFrame);
  });
}

export function stopRenderLoop(ref: RenderLoopRef): void {
  ref.active = false;
  if (ref.frameId !== null) cancelAnimationFrame(ref.frameId);
  ref.frameId = null;
}

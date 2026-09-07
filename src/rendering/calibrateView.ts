import { HandTracker, type VisionFrame } from '../vision/handTracker';
import { computeDualHandFrame, createFrameSmoother, type FrameSmoother } from '../vision/dualHandFrame';
import { trackingCenter } from '../vision/handTracker';
import { drawDualHandFrame, drawHandSkeleton } from './handRenderer';
import { createRenderLoop, startRenderLoop, stopRenderLoop, type RenderLoopRef } from './renderLoop';

export type CalibrateViewRef = {
  renderLoop: RenderLoopRef;
  tracker: HandTracker;
  frameSmoother: FrameSmoother;
  detectedFrames: number;
  locked: boolean;
};

export async function createCalibrateView(canvas: HTMLCanvasElement, video: HTMLVideoElement): Promise<CalibrateViewRef> {
  const tracker = new HandTracker();
  await tracker.initialize();

  const renderLoop = createRenderLoop(canvas, video);
  const ref: CalibrateViewRef = {
    renderLoop,
    tracker,
    frameSmoother: createFrameSmoother(),
    detectedFrames: 0,
    locked: false,
  };

  return ref;
}

export function startCalibrationView(ref: CalibrateViewRef, onLocked: () => void): void {
  let frameCount = 0;

  startRenderLoop(ref.renderLoop, (timestamp) => {
    const context = ref.renderLoop.canvas.getContext('2d');
    if (!context) return;

    const video = ref.renderLoop.video;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) return;
    if (ref.renderLoop.canvas.width !== video.videoWidth || ref.renderLoop.canvas.height !== video.videoHeight) {
      ref.renderLoop.canvas.width = video.videoWidth;
      ref.renderLoop.canvas.height = video.videoHeight;
    }

    const { width, height } = ref.renderLoop.canvas;
    context.clearRect(0, 0, width, height);

    try {
      const vision = ref.tracker.detect(ref.renderLoop.video, timestamp);

      if (vision.hands.length > 0) {
        vision.hands.forEach((hand) => drawHandSkeleton(context, hand, width, height));
      }

      if (vision.hands.length === 2) {
        const centers = vision.hands.map((hand) => trackingCenter(hand));
        const frame = computeDualHandFrame(centers, ref.frameSmoother);

        if (frame && !ref.locked) {
          const stabilityThreshold = 0.005;
          const lastFrame = ref.frameSmoother.value;
          const isStable =
            lastFrame !== null &&
            Math.abs(lastFrame.x - frame.x) < stabilityThreshold &&
            Math.abs(lastFrame.y - frame.y) < stabilityThreshold &&
            Math.abs(lastFrame.width - frame.width) < stabilityThreshold;

          drawDualHandFrame(context, frame, width, height, isStable);

          if (isStable) {
            ref.detectedFrames += 1;
            if (ref.detectedFrames > 24) {
              ref.locked = true;
              onLocked();
              return;
            }
          } else {
            ref.detectedFrames = 0;
          }
        }
      } else {
        ref.detectedFrames = 0;
      }
    } catch (error) {
      console.error('Calibration frame error:', error);
    }

    frameCount += 1;
  });
}

export function disposeCalibrateView(ref: CalibrateViewRef): void {
  stopRenderLoop(ref.renderLoop);
  ref.tracker.dispose();
}

import { HandTracker, type VisionFrame } from '../vision/handTracker';
import { computeDualHandFrame, createFrameSmoother } from '../vision/dualHandFrame';
import { trackingCenter } from '../vision/handTracker';
import { drawDualHandFrame, drawHandSkeleton } from './handRenderer';
import { createRenderLoop, startRenderLoop, stopRenderLoop, type RenderLoopRef } from './renderLoop';

export type CaptureViewRef = {
  renderLoop: RenderLoopRef;
  tracker: HandTracker;
  frameRect: { x: number; y: number; width: number; height: number } | null;
  lastBothPinching: boolean;
  pinchFrames: number;
  capturedCanvas: HTMLCanvasElement | null;
};

export async function createCaptureView(canvas: HTMLCanvasElement, video: HTMLVideoElement): Promise<CaptureViewRef> {
  const tracker = new HandTracker();
  await tracker.initialize();

  const renderLoop = createRenderLoop(canvas, video);
  return {
    renderLoop,
    tracker,
    frameRect: null,
    lastBothPinching: false,
    pinchFrames: 0,
    capturedCanvas: null,
  };
}

export function startCaptureView(
  ref: CaptureViewRef,
  onPinchCapture: (canvas: HTMLCanvasElement) => void,
  onPinchState?: (pinching: boolean) => void,
): void {
  const frameSmoother = createFrameSmoother();

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

      vision.hands.forEach((hand) => {
        drawHandSkeleton(context, hand, width, height, 'rgba(158, 216, 201, 0.4)');
      });

      if (vision.hands.length === 2) {
        const centers = vision.hands.map((hand) => trackingCenter(hand));
        const frame = computeDualHandFrame(centers, frameSmoother);

        if (frame) {
          ref.frameRect = frame;
          drawDualHandFrame(context, frame, width, height, false);
        }

        const pinchSignal = vision.hands.length === 2 && vision.hands.every((hand) => hand.pinchDistance <= 0.12);
        ref.pinchFrames = pinchSignal ? ref.pinchFrames + 1 : 0;
        const bothPinching = ref.pinchFrames >= 2;
        onPinchState?.(pinchSignal);

        if (bothPinching && !ref.lastBothPinching && ref.frameRect) {
          captureFrameRect(ref, onPinchCapture);
        }

        ref.lastBothPinching = bothPinching;
      } else {
        ref.frameRect = null;
        ref.lastBothPinching = false;
        ref.pinchFrames = 0;
        onPinchState?.(false);
      }
    } catch (error) {
      console.error('Capture frame error:', error);
    }
  });
}

function captureFrameRect(ref: CaptureViewRef, onCapture: (canvas: HTMLCanvasElement) => void): void {
  if (!ref.frameRect) return;

  const video = ref.renderLoop.video;
  const frameRect = ref.frameRect;
  const output = document.createElement('canvas');
  output.width = 960;
  output.height = 960;

  const context = output.getContext('2d');
  if (!context) return;

  const cropX = frameRect.x * video.videoWidth;
  const cropY = frameRect.y * video.videoHeight;
  const cropSize = frameRect.width * video.videoWidth;

  context.save();
  context.scale(-1, 1);
  context.translate(-output.width, 0);
  context.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, output.width, output.height);
  context.restore();

  ref.capturedCanvas = output;
  onCapture(output);
}

export function disposeCaptureView(ref: CaptureViewRef): void {
  stopRenderLoop(ref.renderLoop);
  ref.tracker.dispose();
}

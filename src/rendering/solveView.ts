import { HandTracker } from '../vision/handTracker';
import { drawHandSkeleton } from './handRenderer';

export type SolveViewRef = {
  tracker: HandTracker;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  active: boolean;
  frameId: number;
  pinchCell: number | null;
  pinching: boolean;
  cursorX: number | null;
  cursorY: number | null;
};

type SolveViewCallbacks = {
  cellAt: (x: number, y: number) => number | null;
  onCursor: (x: number, y: number, pinching: boolean) => void;
  onPinchStart: (cell: number) => void;
  onPinchMove: (cell: number | null) => void;
  onPinchRelease: (cell: number | null) => void;
};

export async function createSolveView(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<SolveViewRef> {
  const tracker = new HandTracker();
  await tracker.initialize({ numHands: 1 });
  return { tracker, video, canvas, active: false, frameId: 0, pinchCell: null, pinching: false, cursorX: null, cursorY: null };
}

export function startSolveView(ref: SolveViewRef, callbacks: SolveViewCallbacks): void {
  ref.active = true;
  const tick = (timestamp: number) => {
    if (!ref.active) return;
    try {
      if (ref.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || ref.video.videoWidth === 0 || ref.video.videoHeight === 0) {
        ref.frameId = requestAnimationFrame(tick);
        return;
      }
      if (ref.canvas.width !== ref.video.videoWidth || ref.canvas.height !== ref.video.videoHeight) {
        ref.canvas.width = ref.video.videoWidth;
        ref.canvas.height = ref.video.videoHeight;
      }
      const context = ref.canvas.getContext('2d');
      if (!context) return;
      context.clearRect(0, 0, ref.canvas.width, ref.canvas.height);
      const hands = ref.tracker.detect(ref.video, timestamp).hands;
      hands.forEach((hand) => drawHandSkeleton(context, hand, ref.canvas.width, ref.canvas.height, hand.pose === 'PINCH' ? '#c8f2df' : 'rgba(158, 216, 201, 0.7)'));
      const hand = hands[0];
      if (hand) {
        const smoothing = 0.24;
        ref.cursorX = ref.cursorX === null ? hand.indexTip.x : ref.cursorX + (hand.indexTip.x - ref.cursorX) * smoothing;
        ref.cursorY = ref.cursorY === null ? hand.indexTip.y : ref.cursorY + (hand.indexTip.y - ref.cursorY) * smoothing;
      } else {
        ref.cursorX = null;
        ref.cursorY = null;
      }
      const pinchDistance = hand?.pinchDistance ?? Number.POSITIVE_INFINITY;
      const isPinching = ref.pinching ? pinchDistance <= 0.2 : pinchDistance <= 0.14;
      callbacks.onCursor(ref.cursorX === null ? -1 : 1 - ref.cursorX, ref.cursorY ?? -1, isPinching);
      if (isPinching && hand) {
        const cell = callbacks.cellAt(ref.cursorX ?? hand.indexTip.x, ref.cursorY ?? hand.indexTip.y);
        if (ref.pinchCell === null && cell !== null) {
          ref.pinchCell = cell;
          callbacks.onPinchStart(cell);
        } else if (ref.pinchCell !== null) {
          callbacks.onPinchMove(cell);
        }
      } else if (ref.pinchCell !== null) {
        callbacks.onPinchRelease(ref.pinchCell);
        ref.pinchCell = null;
      }
      ref.pinching = isPinching;
    } catch (error) {
      console.error('Solve frame error:', error);
    }
    ref.frameId = requestAnimationFrame(tick);
  };
  ref.frameId = requestAnimationFrame(tick);
}

export function disposeSolveView(ref: SolveViewRef): void {
  ref.active = false;
  cancelAnimationFrame(ref.frameId);
  ref.tracker.dispose();
}
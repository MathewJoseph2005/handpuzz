import type { HandFrame } from '../vision/handTracker';
import { LANDMARK } from '../vision/landmarks';

export function drawHandSkeleton(
  context: CanvasRenderingContext2D,
  hand: HandFrame,
  width: number,
  height: number,
  color: string = 'rgba(158, 216, 201, 0.7)',
): void {
  const landmarks = hand.landmarks;
  const fingerIndices = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20],
  ];

  context.strokeStyle = color;
  context.lineWidth = 1.5;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  fingerIndices.forEach((indices) => {
    context.beginPath();
    indices.forEach((i, step) => {
      const point = landmarks[i];
      const x = point.x * width;
      const y = point.y * height;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  });

  context.fillStyle = color;
  landmarks.forEach((point) => {
    const x = point.x * width;
    const y = point.y * height;
    context.beginPath();
    context.arc(x, y, 3, 0, 2 * Math.PI);
    context.fill();
  });
}

export function drawDualHandFrame(
  context: CanvasRenderingContext2D,
  frameRect: { x: number; y: number; width: number; height: number },
  width: number,
  height: number,
  stable: boolean = false,
): void {
  const x = frameRect.x * width;
  const y = frameRect.y * height;
  const w = frameRect.width * width;
  const h = frameRect.height * height;

  const cornerSize = 18;
  const color = stable ? '#c8f2df' : '#9ed8c9';
  const glowColor = stable ? 'rgba(200, 242, 223, 0.6)' : 'rgba(158, 216, 201, 0.3)';

  context.strokeStyle = glowColor;
  context.lineWidth = 6;
  context.strokeRect(x, y, w, h);

  context.strokeStyle = color;
  context.lineWidth = 1.5;
  context.strokeRect(x, y, w, h);

  const corners = [
    { x, y },
    { x: x + w, y },
    { x, y: y + h },
    { x: x + w, y: y + h },
  ];

  corners.forEach(({ x: cx, y: cy }, i) => {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    if (i === 0) {
      context.moveTo(cx, cy + cornerSize);
      context.lineTo(cx, cy);
      context.lineTo(cx + cornerSize, cy);
    } else if (i === 1) {
      context.moveTo(cx - cornerSize, cy);
      context.lineTo(cx, cy);
      context.lineTo(cx, cy + cornerSize);
    } else if (i === 2) {
      context.moveTo(cx, cy - cornerSize);
      context.lineTo(cx, cy);
      context.lineTo(cx + cornerSize, cy);
    } else {
      context.moveTo(cx - cornerSize, cy);
      context.lineTo(cx, cy);
      context.lineTo(cx, cy - cornerSize);
    }
    context.stroke();
  });
}

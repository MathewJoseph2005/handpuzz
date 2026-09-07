import { distance, handScale, LANDMARK, type Point3D } from './landmarks';

export type HandPose = 'OPEN' | 'PINCH' | 'FIST';

type PoseMemory = {
  pose: HandPose;
  candidate: HandPose;
  candidateFrames: number;
};

export type PoseResult = {
  pose: HandPose;
  pinchDistance: number;
};

const PINCH_ENTER = 0.045;
const PINCH_EXIT = 0.06;
const FIST_RATIO = 0.78;
const REQUIRED_FRAMES = 3;

export function classifyPose(landmarks: Point3D[], memory: PoseMemory): PoseResult {
  const scale = handScale(landmarks);
  const pinchDistance = distance(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.INDEX_TIP]) / scale;
  const palm = midpoint3(landmarks[LANDMARK.WRIST], landmarks[LANDMARK.MIDDLE_MCP]);
  const fingertipIndices = [LANDMARK.INDEX_TIP, LANDMARK.MIDDLE_TIP, LANDMARK.RING_TIP, LANDMARK.PINKY_TIP];
  const averageFingerDistance = fingertipIndices.reduce((sum, index) => sum + distance(landmarks[index], palm), 0) / fingertipIndices.length / scale;

  const nextPose = pinchDistance <= (memory.pose === 'PINCH' ? PINCH_EXIT : PINCH_ENTER)
    ? 'PINCH'
    : averageFingerDistance < FIST_RATIO
      ? 'FIST'
      : 'OPEN';

  if (nextPose === memory.pose) {
    memory.candidate = nextPose;
    memory.candidateFrames = 0;
  } else if (nextPose === memory.candidate) {
    memory.candidateFrames += 1;
    if (memory.candidateFrames >= REQUIRED_FRAMES) {
      memory.pose = nextPose;
      memory.candidateFrames = 0;
    }
  } else {
    memory.candidate = nextPose;
    memory.candidateFrames = 1;
  }

  return { pose: memory.pose, pinchDistance };
}

function midpoint3(a: Point3D, b: Point3D): Point3D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

export function createPoseMemory(): PoseMemory {
  return { pose: 'OPEN', candidate: 'OPEN', candidateFrames: 0 };
}

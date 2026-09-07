import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LANDMARK, midpoint, type Point3D } from './landmarks';
import { classifyPose, createPoseMemory, type HandPose } from './poseClassifier';

export type HandFrame = {
  handedness: 'Left' | 'Right';
  pose: HandPose;
  pinchDistance: number;
  indexTip: Point3D;
  landmarks: NormalizedLandmark[];
};

export type VisionFrame = {
  hands: HandFrame[];
  timestamp: number;
};

export type HandTrackerOptions = {
  modelAssetPath?: string;
  wasmRoot?: string;
  numHands?: number;
};

export class HandTracker {
  private landmarker: HandLandmarker | null = null;
  private readonly poseMemory = [createPoseMemory(), createPoseMemory()];

  async initialize(options: HandTrackerOptions = {}): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(options.wasmRoot ?? '/models/wasm');
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: options.modelAssetPath ?? '/models/hand_landmarker.task',
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numHands: options.numHands ?? 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  detect(video: HTMLVideoElement, timestamp: number): VisionFrame {
    if (!this.landmarker) throw new Error('Hand tracker has not been initialized.');
    const result = this.landmarker.detectForVideo(video, timestamp);
    const hands = result.landmarks.map((landmarks, index) => {
      const normalized = landmarks as NormalizedLandmark[];
      const classified = classifyPose(normalized, this.poseMemory[index] ?? this.poseMemory[0]);
      const handednessStr = result.handedness[index]?.[0]?.categoryName;
      const handedness: 'Left' | 'Right' = handednessStr === 'Left' ? 'Left' : 'Right';
      return {
        handedness,
        pose: classified.pose,
        pinchDistance: classified.pinchDistance,
        indexTip: point(normalized[LANDMARK.INDEX_TIP]),
        landmarks: normalized,
      };
    });

    return { hands, timestamp };
  }

  dispose(): void {
    this.landmarker?.close();
    this.landmarker = null;
  }
}

export function trackingCenter(frame: HandFrame): Point3D {
  return midpoint(point(frame.landmarks[LANDMARK.WRIST]), point(frame.landmarks[LANDMARK.MIDDLE_MCP]));
}

function point(landmark: NormalizedLandmark): Point3D {
  return { x: landmark.x, y: landmark.y, z: landmark.z };
}

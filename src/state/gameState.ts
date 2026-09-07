export type GamePhase =
  | { phase: 'BOOT' }
  | { phase: 'CALIBRATION' }
  | { phase: 'CAPTURE'; frameStable: boolean }
  | { phase: 'SOLVING'; startedAt: number; gridSize: 3 | 4 }
  | { phase: 'PAUSED'; pausedAt: number }
  | { phase: 'COMPLETE'; elapsedMs: number }
  | { phase: 'LEADERBOARD' }
  | { phase: 'ERROR'; reason: 'camera' | 'vision' | 'unknown'; message: string };

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error';

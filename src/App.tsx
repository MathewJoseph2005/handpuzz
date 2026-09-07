import { useCallback, useEffect, useRef, useState } from 'react';
import { BootScreen } from './components/BootScreen';
import { CalibrationScreen } from './components/CalibrationScreen';
import { CaptureScreen } from './components/CaptureScreen';
import { CompleteScreen } from './components/CompleteScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { SolveScreen } from './components/SolveScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { recordScore } from './state/leaderboardStore';
import { DiagnosticsOverlay } from './components/DiagnosticsOverlay';
import type { GamePhase } from './state/gameState';

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Camera permission was denied. Enable the camera or continue with the mouse and touch fallback.';
  }
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'No camera was found on this device. Continue in manual mode to use the puzzle without live capture.';
  }
  return 'The camera could not be initialized. Continue in manual mode or check the browser camera settings.';
}

export function App() {
  const [game, setGame] = useState<GamePhase>({ phase: 'BOOT' });
  const videoRef = useRef<HTMLVideoElement>(null) as React.MutableRefObject<HTMLVideoElement | null>;
  const streamRef = useRef<MediaStream | null>(null);
  const capturedSourceRef = useRef<HTMLCanvasElement | null>(null);
  const capturedGridSizeRef = useRef<3 | 4>(3);
  const scoreRecordedRef = useRef(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const returnToBoot = useCallback(() => {
    stopCamera();
    capturedSourceRef.current = null;
    setGame({ phase: 'BOOT' });
  }, [stopCamera]);

  const initializeSystem = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setGame({ phase: 'ERROR', reason: 'camera', message: 'This browser does not expose camera access. Continue in manual mode.' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setGame({ phase: 'CAPTURE', frameStable: false });
    } catch (error) {
      stopCamera();
      setGame({ phase: 'ERROR', reason: 'camera', message: cameraErrorMessage(error) });
    }
  }, [stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  const diagnostics = <DiagnosticsOverlay />;
  if (game.phase === 'BOOT') return <>{diagnostics}<BootScreen onInitialize={initializeSystem} /></>;
  if (game.phase === 'CALIBRATION') {
    return <>{diagnostics}<CalibrationScreen videoRef={videoRef} onBack={returnToBoot} onContinueFallback={() => { stopCamera(); setGame({ phase: 'CAPTURE', frameStable: false }); }} onLocked={() => setGame({ phase: 'CAPTURE', frameStable: false })} /></>;
  }
  if (game.phase === 'ERROR') {
    return <>{diagnostics}<ErrorScreen message={game.message} onBack={returnToBoot} onFallback={() => setGame({ phase: 'CAPTURE', frameStable: false })} /></>;
  }
  if (game.phase === 'CAPTURE') {
    const activeStream = streamRef.current?.active ? streamRef.current : null;
    return <>{diagnostics}<CaptureScreen
      videoRef={videoRef as React.RefObject<HTMLVideoElement>}
      stream={activeStream}
      onBack={returnToBoot}
      onCaptured={(source, gridSize) => {
        capturedSourceRef.current = source;
        capturedGridSizeRef.current = gridSize;
        scoreRecordedRef.current = false;
        setGame({ phase: 'SOLVING', startedAt: Date.now(), gridSize });
      }}
    /></>;
  }
  if (game.phase === 'SOLVING' && capturedSourceRef.current) {
    return <>{diagnostics}<SolveScreen source={capturedSourceRef.current} gridSize={capturedGridSizeRef.current} videoRef={videoRef as React.RefObject<HTMLVideoElement>} stream={streamRef.current?.active ? streamRef.current : null} onBack={returnToBoot} onSolved={(elapsedMs) => setGame({ phase: 'COMPLETE', elapsedMs })} /></>;
  }
  if (game.phase === 'COMPLETE') {
    if (!scoreRecordedRef.current) {
      scoreRecordedRef.current = true;
    }
    return <>{diagnostics}<CompleteScreen elapsedMs={game.elapsedMs} gridSize={capturedGridSizeRef.current} onBack={returnToBoot} onComplete={(name) => { recordScore(name, game.elapsedMs, capturedGridSizeRef.current); setGame({ phase: 'LEADERBOARD' }); }} onLeaderboard={() => setGame({ phase: 'LEADERBOARD' })} /></>;
  }
  if (game.phase === 'LEADERBOARD') {
    return <>{diagnostics}<LeaderboardScreen onBack={returnToBoot} /></>;
  }

  return <>{diagnostics}<main className="terminal-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <section className="boot-panel" aria-labelledby="manual-title">
        <div className="boot-panel__eyebrow">PHASE 1 // CAPTURE</div>
        <h1 id="manual-title">Manual capture interface<span className="cursor">_</span></h1>
        <p className="boot-panel__subline">Camera and hand tracking are not connected yet. The manual image-upload path will be enabled in the next checkpoint.</p>
      </section>
    </main></>;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { BootScreen } from './components/BootScreen';
import { CalibrationScreen } from './components/CalibrationScreen';
import { ErrorScreen } from './components/ErrorScreen';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const initializeSystem = useCallback(async () => {
    setGame({ phase: 'CALIBRATION' });
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
    } catch (error) {
      stopCamera();
      setGame({ phase: 'ERROR', reason: 'camera', message: cameraErrorMessage(error) });
    }
  }, [stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  if (game.phase === 'BOOT') return <BootScreen onInitialize={initializeSystem} />;
  if (game.phase === 'CALIBRATION') {
    return <CalibrationScreen videoRef={videoRef} onContinueFallback={() => { stopCamera(); setGame({ phase: 'CAPTURE', frameStable: false }); }} />;
  }
  if (game.phase === 'ERROR') {
    return <ErrorScreen message={game.message} onFallback={() => setGame({ phase: 'CAPTURE', frameStable: false })} />;
  }

  return (
    <main className="terminal-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <section className="boot-panel" aria-labelledby="manual-title">
        <div className="boot-panel__eyebrow">PHASE 1 // CAPTURE</div>
        <h1 id="manual-title">Manual capture interface<span className="cursor">_</span></h1>
        <p className="boot-panel__subline">Camera and hand tracking are not connected yet. The manual image-upload path will be enabled in the next checkpoint.</p>
      </section>
    </main>
  );
}

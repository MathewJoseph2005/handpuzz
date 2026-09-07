import { useEffect, useRef, type RefObject } from 'react';
import { createCalibrateView, disposeCalibrateView, startCalibrationView } from '../rendering/calibrateView';
import { BackButton } from './BackButton';

type CalibrationScreenProps = {
  videoRef: RefObject<HTMLVideoElement>;
  onContinueFallback: () => void;
  onLocked: () => void;
  onBack: () => void;
};

export function CalibrationScreen({ videoRef, onContinueFallback, onLocked, onBack }: CalibrationScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calibrateViewRef = useRef<Awaited<ReturnType<typeof createCalibrateView>> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !canvasRef.current || !videoRef.current) return;
    initializedRef.current = true;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    createCalibrateView(canvas, video).then((view) => {
      calibrateViewRef.current = view;
      startCalibrationView(view, onLocked);
    }).catch((error) => {
      console.error('Failed to initialize calibration view:', error);
      onContinueFallback();
    });

    return () => {
      if (calibrateViewRef.current) {
        disposeCalibrateView(calibrateViewRef.current);
        calibrateViewRef.current = null;
      }
    };
  }, [videoRef, onLocked, onContinueFallback]);

  return (
    <main className="terminal-shell calibration-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <BackButton onBack={onBack} />

      <header className="hud-corner hud-corner--top-left">
        <span className="hud-kicker">OPTICAL SENSOR / CALIBRATION</span>
        <strong>LAST HORIZON</strong>
      </header>

      <div className="hud-corner hud-corner--top-right" aria-label="System status">
        <span className="status-light status-light--live" />
        <span>OPTICAL SENSOR <b className="status-live">ONLINE</b></span>
        <span>CAMERA DATA PROCESSED LOCALLY</span>
      </div>

      <section className="calibration-panel" aria-labelledby="calibration-title">
        <div className="calibration-panel__header">
          <span className="boot-panel__eyebrow">PHASE 0.5 // SENSOR CHECK</span>
          <span className="calibration-panel__code">CAL-001</span>
        </div>
        <h1 id="calibration-title">Calibrating optical tracking<span className="cursor">_</span></h1>
        <p className="boot-panel__subline">Raise one hand into frame. Hold position until the tracking lock confirms.</p>

        <div className="camera-stage">
          <video ref={videoRef} autoPlay playsInline muted className="camera-stage__video" />
          <canvas ref={canvasRef} className="camera-stage__canvas" />
          <span className="camera-stage__label">LIVE / MIRRORED / LOCAL / HAND TRACKING</span>
        </div>

        <div className="calibration-readout">
          <span><i className="status-dot" /> HAND DETECTION ACTIVE</span>
          <span>RAISE BOTH HANDS TO LOCK</span>
          <span>TRACKING <b>LIVE</b></span>
        </div>

        <button className="text-button" type="button" onClick={onContinueFallback}>
          <span className="button-bracket">[</span> CONTINUE WITHOUT CAMERA <span className="button-bracket">]</span>
        </button>
      </section>

      <footer className="system-bar">
        <span>LH-01 / CALIBRATION</span>
        <span>VISION PIPELINE STANDBY</span>
        <span>AWAITING HAND</span>
      </footer>
    </main>
  );
}

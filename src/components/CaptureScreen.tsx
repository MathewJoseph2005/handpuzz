import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createCaptureView, disposeCaptureView, startCaptureView, type CaptureViewRef } from '../rendering/captureView';
import type { GridSize } from '../puzzle/puzzleEngine';
import { BackButton } from './BackButton';

type CaptureScreenProps = {
  videoRef: RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  onCaptured: (source: HTMLCanvasElement, gridSize: GridSize) => void;
  onBack: () => void;
};

export function CaptureScreen({ videoRef, stream, onCaptured, onBack }: CaptureScreenProps) {
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [status, setStatus] = useState('AWAITING LOCAL IMAGE');
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureViewRef = useRef<CaptureViewRef | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !stream) return;

    video.srcObject = stream;
    void video.play();
    let mounted = true;

    createCaptureView(canvas, video).then((view) => {
      if (!mounted) {
        disposeCaptureView(view);
        return;
      }

      captureViewRef.current = view;
      setStatus('HAND TRACKING ACTIVE / PINCH BOTH HANDS TO SNAP');
      startCaptureView(view, (source) => {
        if (!mounted) return;
        onCaptured(source, gridSize);
      }, (pinching) => {
        if (mounted) setStatus(pinching ? 'PINCH DETECTED / CAPTURING' : 'HAND TRACKING ACTIVE / PINCH BOTH HANDS TO SNAP');
      });
    }).catch((error) => {
      console.error('Failed to initialize capture view:', error);
      setStatus('HAND TRACKING UNAVAILABLE / USE UPLOAD');
    });

    return () => {
      mounted = false;
      if (captureViewRef.current) {
        disposeCaptureView(captureViewRef.current);
        captureViewRef.current = null;
      }
    };
  }, [gridSize, onCaptured, stream, videoRef]);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      setStatus('SELECT A VALID IMAGE FILE');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const source = document.createElement('canvas');
      source.width = 960;
      source.height = 960;
      const context = source.getContext('2d');
      if (!context) return;
      context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, source.width, source.height);
      URL.revokeObjectURL(objectUrl);
      onCaptured(source, gridSize);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setStatus('IMAGE COULD NOT BE READ');
    };
    image.src = objectUrl;
    setStatus('READING LOCAL IMAGE');
  };

  return (
    <main className="terminal-shell capture-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <BackButton onBack={onBack} />
      {stream && (
        <div className="camera-stage">
          <video ref={videoRef} autoPlay playsInline muted className="camera-stage__video" />
          <canvas ref={canvasRef} className="camera-stage__canvas" />
          <span className="camera-stage__label">LIVE / MIRRORED / PINCH TO CAPTURE</span>
        </div>
      )}
      <header className="hud-corner hud-corner--top-left">
        <span className="hud-kicker">LIVE PUZZLE / {stream ? 'CAPTURE PHASE' : 'MANUAL FALLBACK'}</span>
        <strong>LAST HORIZON</strong>
      </header>
      <div className="hud-corner hud-corner--top-right">
        <span className="status-light status-light--live" />
        <span>CAMERA <b className="status-live">{stream ? 'LIVE' : 'OPTIONAL'}</b></span>
        <span>LOCAL IMAGE ONLY</span>
      </div>

      {stream ? (
        <section className="capture-live-status" aria-label="Live capture status">
          <span className="boot-panel__eyebrow">PHASE 1 // DIRECT CAPTURE</span>
          <h1>PINCH TO START<span className="cursor">_</span></h1>
          <p>Frame both hands, then pinch once. The puzzle starts immediately.</p>
          <strong>{status}</strong>
        </section>
      ) : (
        <section className="capture-panel" aria-labelledby="capture-title">
          <div className="boot-panel__eyebrow">PHASE 1 // MANUAL CAPTURE</div>
          <h1 id="capture-title">Frame the final light<span className="cursor">_</span></h1>
          <p className="boot-panel__subline">Upload a local image to enter manual reconstruction.</p>
          <button className="upload-zone" type="button" onClick={() => inputRef.current?.click()}>
            <span className="upload-zone__mark">＋</span>
            <span>SELECT LOCAL IMAGE</span>
            <small>{status}</small>
          </button>
          <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} />
          <div className="grid-choice" aria-label="Puzzle grid size">
            <span>GRID DENSITY</span>
            <button className={gridSize === 3 ? 'grid-choice__active' : ''} onClick={() => setGridSize(3)} type="button">3 × 3</button>
            <button className={gridSize === 4 ? 'grid-choice__active' : ''} onClick={() => setGridSize(4)} type="button">4 × 4</button>
          </div>
          <p className="capture-panel__privacy">CAMERA DATA PROCESSED LOCALLY / IMAGE DISCARDED AFTER SESSION</p>
        </section>
      )}
      <footer className="system-bar"><span>LH-02 / CAPTURE</span><span>{stream ? 'LIVE CAMERA' : 'MANUAL MODE'}</span><span>{status}</span></footer>
    </main>
  );
}

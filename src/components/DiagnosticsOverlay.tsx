import { useEffect, useRef, useState } from 'react';

export function DiagnosticsOverlay() {
  const [open, setOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastSample = useRef(performance.now());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    let frame = 0;
    const sample = (timestamp: number) => {
      frameCount.current += 1;
      if (timestamp - lastSample.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastSample.current = timestamp;
      }
      frame = requestAnimationFrame(sample);
    };
    frame = requestAnimationFrame(sample);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!open) return null;
  return (
    <aside className="diagnostics-overlay" aria-label="Developer diagnostics">
      <strong>DIAGNOSTICS / LOCAL</strong>
      <span>RAF FPS <b>{fps}</b></span>
      <span>CAMERA <b>{document.querySelector('video')?.srcObject ? 'ACTIVE' : 'IDLE'}</b></span>
      <span>STORAGE <b>{storageAvailable() ? 'READY' : 'BLOCKED'}</b></span>
    </aside>
  );
}

function storageAvailable(): boolean {
  try {
    const key = '__lh_diagnostics__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
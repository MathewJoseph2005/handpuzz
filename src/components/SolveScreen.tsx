import { useEffect, useRef, useState } from 'react';
import { drawTile, createTileSheet, type TileSheet } from '../puzzle/puzzleGenerator';
import { PuzzleEngine, type GridSize } from '../puzzle/puzzleEngine';
import { createSolveView, disposeSolveView, startSolveView, type SolveViewRef } from '../rendering/solveView';
import { BackButton } from './BackButton';

type SolveScreenProps = {
  source: HTMLCanvasElement;
  gridSize: GridSize;
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  onSolved: (elapsedMs: number) => void;
  onBack: () => void;
};

export function SolveScreen({ source, gridSize, videoRef, stream, onSolved, onBack }: SolveScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(new PuzzleEngine(gridSize));
  const sheetRef = useRef<TileSheet>(createTileSheet(source, gridSize));
  const dragRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const cursorRef = useRef<{ x: number; y: number; visible: boolean; pinching: boolean }>({ x: 0, y: 0, visible: false, pinching: false });
  const startedAtRef = useRef(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const solveViewRef = useRef<SolveViewRef | null>(null);
  const [handStatus, setHandStatus] = useState(stream ? 'HAND INPUT READY' : 'MANUAL INPUT');

  useEffect(() => {
    engineRef.current.reshuffle();
    startedAtRef.current = Date.now();
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!stream || !video) return;
    let mounted = true;
    video.srcObject = stream;
    void video.play();
    const handCanvas = handCanvasRef.current;
    if (!handCanvas) return;
    createSolveView(video, handCanvas).then((view) => {
      if (!mounted) {
        disposeSolveView(view);
        return;
      }
      solveViewRef.current = view;
      startSolveView(view, {
        cellAt: (x, y) => Math.floor(y * gridSize) * gridSize + Math.floor((1 - x) * gridSize),
        onCursor: (x, y, pinching) => {
          cursorRef.current = { x, y, visible: x >= 0 && y >= 0 && x <= 1 && y <= 1, pinching };
        },
        onPinchStart: (cell) => {
          dragRef.current = cell;
          selectedRef.current = cell;
          hoveredRef.current = cell;
          setHovered(cell);
          setHandStatus('PINCH LOCKED / MOVE TO TARGET');
        },
        onPinchMove: (cell) => {
          hoveredRef.current = cell;
          setHovered(cell);
        },
        onPinchRelease: (cell) => {
          const target = hoveredRef.current;
          const selected = selectedRef.current ?? cell;
          dragRef.current = null;
          selectedRef.current = null;
          if (selected !== null && target !== null) {
            engineRef.current.swap(selected, target);
            hoveredRef.current = null;
            setHovered(null);
            setHandStatus('HAND INPUT READY');
            if (engineRef.current.isSolved()) onSolved(Date.now() - startedAtRef.current);
          }
        },
      });
    }).catch((error) => {
      console.error('Failed to initialize solve view:', error);
      setHandStatus('HAND INPUT UNAVAILABLE / MANUAL MODE');
    });
    return () => {
      mounted = false;
      if (solveViewRef.current) {
        disposeSolveView(solveViewRef.current);
        solveViewRef.current = null;
      }
    };
  }, [gridSize, onSolved, stream, videoRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let active = true;
    let frame = 0;
    const draw = () => {
      if (!active) return;
      const size = Math.min(canvas.clientWidth, canvas.clientHeight);
      const pixelRatio = window.devicePixelRatio || 1;
      if (canvas.width !== Math.floor(size * pixelRatio)) {
        canvas.width = Math.floor(size * pixelRatio);
        canvas.height = Math.floor(size * pixelRatio);
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, size, size);
      const tileSize = size / gridSize;
      engineRef.current.state.forEach((tile, index) => {
        const x = (index % gridSize) * tileSize;
        const y = Math.floor(index / gridSize) * tileSize;
        const selected = selectedRef.current === index;
        if (!selected) drawTile(context, sheetRef.current, tile, { x: x + 2, y: y + 2, size: tileSize - 4 });
        context.strokeStyle = selected ? '#ffca72' : index === hovered ? '#c8f2df' : 'rgba(158, 216, 201, 0.34)';
        context.lineWidth = selected || index === hovered ? 2 : 1;
        context.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        if (selected) {
          context.fillStyle = 'rgba(255, 202, 114, 0.12)';
          context.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        }
        context.fillStyle = 'rgba(7, 11, 12, 0.76)';
        context.fillRect(x + 8, y + 8, 24, 16);
        context.fillStyle = '#c4d8ce';
        context.font = '10px monospace';
        context.fillText(String(tile + 1).padStart(2, '0'), x + 12, y + 19);
      });
      const cursor = cursorRef.current;
      const selected = selectedRef.current;
      if (selected !== null && cursor.visible) {
        const tile = engineRef.current.state[selected];
        const liftedSize = tileSize - 4;
        context.save();
        context.shadowColor = 'rgba(200, 242, 223, 0.55)';
        context.shadowBlur = 18;
        drawTile(context, sheetRef.current, tile, {
          x: cursor.x * size - liftedSize / 2,
          y: cursor.y * size - liftedSize / 2,
          size: liftedSize,
        });
        context.restore();
      }
      if (cursor.visible) {
        const cursorX = cursor.x * size;
        const cursorY = cursor.y * size;
        context.strokeStyle = cursor.pinching ? '#ffca72' : '#c8f2df';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(cursorX, cursorY, cursor.pinching ? 13 : 10, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.moveTo(cursorX - 18, cursorY);
        context.lineTo(cursorX + 18, cursorY);
        context.moveTo(cursorX, cursorY - 18);
        context.lineTo(cursorX, cursorY + 18);
        context.stroke();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [gridSize, hovered]);

  const cellAt = (event: React.PointerEvent<HTMLCanvasElement>): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * gridSize);
    const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * gridSize);
    return x >= 0 && x < gridSize && y >= 0 && y < gridSize ? y * gridSize + x : null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const cell = cellAt(event);
    if (cell === null) return;
    dragRef.current = cell;
    hoveredRef.current = cell;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const from = dragRef.current;
    const to = cellAt(event);
    dragRef.current = null;
    hoveredRef.current = to;
    if (from === null || to === null || !engineRef.current.swap(from, to)) return;
    if (engineRef.current.isSolved()) onSolved(Date.now() - startedAtRef.current);
  };

  const reset = () => {
    engineRef.current.reshuffle();
    startedAtRef.current = Date.now();
    setElapsedMs(0);
  };

  return (
    <main className="terminal-shell solve-shell">
      <div className="atmosphere" aria-hidden="true" /><div className="scanlines" aria-hidden="true" /><div className="vignette" aria-hidden="true" />
      <BackButton onBack={onBack} />
      <header className="hud-corner hud-corner--top-left"><span className="hud-kicker">LIVE PUZZLE / RECONSTRUCTION</span><strong>LAST HORIZON</strong></header>
      <div className="hud-corner hud-corner--top-right"><span>PHASE 2 <b>ACTIVE</b></span><span>MANUAL INPUT</span></div>
      <section className="solve-panel" aria-labelledby="solve-title">
        <div className="solve-panel__heading"><div><span className="boot-panel__eyebrow">PHASE 2 // RECONSTRUCT</span><h1 id="solve-title">Matrix realignment<span className="cursor">_</span></h1></div><div className="timer">{formatTime(elapsedMs)}</div></div>
        <p className="solve-instruction">{handStatus} / PINCH OR DRAG A TILE TO SWAP POSITIONS</p>
        {stream && <>
          <video ref={videoRef} autoPlay playsInline muted className="solve-vision-source" aria-hidden="true" />
          <canvas ref={handCanvasRef} className="solve-vision-source" aria-hidden="true" />
        </>}
        <canvas ref={canvasRef} className="puzzle-canvas" onPointerDown={handlePointerDown} onPointerMove={(event) => setHovered(cellAt(event))} onPointerUp={handlePointerUp} onPointerCancel={() => { dragRef.current = null; }} />
        <div className="solve-controls"><span>GRID {gridSize} × {gridSize}</span><button className="text-button" type="button" onClick={reset}>[ RESET MATRIX ]</button></div>
      </section>
      <footer className="system-bar"><span>LH-03 / SOLVING</span><span>CAMERA DATA LOCAL</span><span>RESTORE ORDER</span></footer>
    </main>
  );
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

import { useState } from 'react';
import { BackButton } from './BackButton';

type CompleteScreenProps = { elapsedMs: number; gridSize: 3 | 4; onBack: () => void; onComplete: (name: string) => void; onLeaderboard: () => void };

export function CompleteScreen({ elapsedMs, onBack, onComplete, onLeaderboard }: CompleteScreenProps) {
  const [name, setName] = useState('');
  return (
    <main className="terminal-shell complete-shell">
      <div className="atmosphere" aria-hidden="true" /><div className="scanlines" aria-hidden="true" /><div className="vignette" aria-hidden="true" />
      <BackButton onBack={onBack} />
      <section className="complete-panel" aria-labelledby="complete-title">
        <span className="complete-panel__mark">▲</span>
        <span className="error-panel__eyebrow complete-panel__eyebrow">ACCESS GRANTED</span>
        <h1 id="complete-title">Matrix restored</h1>
        <p className="complete-panel__time">{formatTime(elapsedMs)}</p>
        <p className="boot-panel__subline">MISSION COMPLETE / OPERATIVE RECORD READY</p>
        <label className="name-field">OPERATIVE NAME<input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="ENTER NAME" /></label>
        <div className="complete-actions">
          <button className="initialize-button" type="button" disabled={!name.trim()} onClick={() => onComplete(name.trim())}><span className="button-bracket">[</span> SAVE RECORD <span className="button-bracket">]</span></button>
          <button className="text-button" type="button" onClick={onLeaderboard}>[ VIEW RECORD ]</button>
        </div>
      </section>
    </main>
  );
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

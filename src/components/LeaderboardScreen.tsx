import { useEffect, useState } from 'react';
import { readLeaderboard, type LeaderboardEntry } from '../state/leaderboardStore';
import { BackButton } from './BackButton';

type LeaderboardScreenProps = { onBack: () => void };

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => setEntries(readLeaderboard()), []);

  return (
    <main className="terminal-shell complete-shell">
      <div className="atmosphere" aria-hidden="true" /><div className="scanlines" aria-hidden="true" /><div className="vignette" aria-hidden="true" />
      <BackButton onBack={onBack} />
      <section className="leaderboard-panel" aria-labelledby="leaderboard-title">
        <span className="error-panel__eyebrow complete-panel__eyebrow">OPERATIVE RECORD</span>
        <h1 id="leaderboard-title">Mission times</h1>
        <div className="leaderboard-list">
          {entries.length === 0 && <p className="boot-panel__subline">NO LOCAL RECORDS YET</p>}
          {entries.map((entry, index) => (
            <div className="leaderboard-row" key={entry.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{entry.name}</span>
              <strong>{formatTime(entry.elapsedMs)}</strong>
              <span>GRID {entry.gridSize} × {entry.gridSize}</span>
              <span>{new Date(entry.recordedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        <button className="text-button" type="button" onClick={onBack}>[ NEW MISSION ]</button>
      </section>
    </main>
  );
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
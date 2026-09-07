import { useEffect, useState } from 'react';

type DiagnosticState = 'pending' | 'online' | 'standby';

type Diagnostic = {
  label: string;
  value: string;
  state: DiagnosticState;
};

type BootScreenProps = {
  onInitialize: () => void;
};

const initialDiagnostics: Diagnostic[] = [
  { label: 'NEURAL INTERFACE', value: 'ONLINE', state: 'online' },
  { label: 'OPTICAL SENSOR', value: 'ONLINE', state: 'online' },
  { label: 'HAND TRACKING', value: 'STANDBY', state: 'standby' },
  { label: 'CORE SYSTEM', value: '87%', state: 'online' },
  { label: 'CONNECTION', value: 'SECURE', state: 'online' },
];

export function BootScreen({ onInitialize }: BootScreenProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const revealTimer = window.setInterval(() => {
      setRevealedCount((count) => Math.min(count + 1, initialDiagnostics.length));
    }, 220);

    return () => window.clearInterval(revealTimer);
  }, []);

  const handleInitialize = () => {
    setInitialized(true);
    onInitialize();
  };

  return (
    <main className="terminal-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <header className="hud-corner hud-corner--top-left">
        <span className="hud-kicker">CLASSIFIED / FIELD INTERFACE</span>
        <strong>LAST HORIZON</strong>
      </header>

      <div className="hud-corner hud-corner--top-right" aria-label="System status">
        <span className="status-light" />
        <span>OPTICAL SENSOR <b>STANDBY</b></span>
        <span>LOCAL PROCESSING</span>
      </div>

      <section className="boot-panel" aria-labelledby="boot-title">
        <div className="boot-panel__eyebrow">PROJECT: LAST HORIZON <span>// 01</span></div>
        <h1 id="boot-title">Tactical interface initializing<span className="cursor">_</span></h1>
        <p className="boot-panel__subline">A hand-operated reconstruction protocol for the final light.</p>

        <div className="diagnostics" aria-live="polite">
          {initialDiagnostics.map((diagnostic, index) => {
            const visible = index < revealedCount;
            return (
              <div className={`diagnostic ${visible ? 'diagnostic--visible' : ''}`} key={diagnostic.label}>
                <span className="diagnostic__prompt">&gt;</span>
                <span className="diagnostic__label">{diagnostic.label}</span>
                <span className="diagnostic__dots" aria-hidden="true">{'.'.repeat(visible ? 3 : 10)}</span>
                <span className={`diagnostic__value diagnostic__value--${diagnostic.state}`}>
                  {visible ? diagnostic.value : 'PENDING'}
                </span>
              </div>
            );
          })}
        </div>

        <button className={`initialize-button ${initialized ? 'initialize-button--active' : ''}`} onClick={handleInitialize} type="button">
          <span className="button-bracket">[</span>
          <span>{initialized ? 'SYSTEM ARMED' : 'INITIALIZE SYSTEM'}</span>
          <span className="button-bracket">]</span>
        </button>

        <div className="boot-panel__footer">
          <span>CAMERA DATA PROCESSED LOCALLY</span>
          <span>NO SIGNAL LEAVES THIS DEVICE</span>
        </div>
      </section>

      <footer className="system-bar">
        <span>LH-00 / PRE-DEPLOYMENT</span>
        <span>07.09.2026</span>
        <span>AWAITING OPERATOR</span>
      </footer>
    </main>
  );
}

type ErrorScreenProps = {
  message: string;
  onFallback: () => void;
};

export function ErrorScreen({ message, onFallback }: ErrorScreenProps) {
  return (
    <main className="terminal-shell error-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <section className="error-panel" aria-labelledby="error-title">
        <span className="error-panel__eyebrow">SYSTEM FAULT // OPTICAL SENSOR</span>
        <h1 id="error-title">Optical sensor offline<span className="cursor">_</span></h1>
        <p className="boot-panel__subline">{message}</p>
        <p className="error-panel__note">The mission can continue in manual mode. Camera frames remain local and are never uploaded.</p>
        <button className="initialize-button" type="button" onClick={onFallback}>
          <span className="button-bracket">[</span> ENTER MANUAL MODE <span className="button-bracket">]</span>
        </button>
      </section>
    </main>
  );
}
